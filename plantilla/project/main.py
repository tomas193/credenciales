import sqlite3
import smtplib
import csv
import threading
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import json
conn = sqlite3.connect('credenciales.db')
from datetime import datetime,timedelta, date
import queue
import pytz

with open('data.json', 'r') as archivo:
    datos = json.load(archivo)

with open('calendario_escolar.json', 'r') as archivo:
    calendar = json.load(archivo)

cola_alumnos=queue.Queue()

print("Ingresar Matriculas: ")

ahora_LA = datetime.now(pytz.timezone('America/Los_Angeles'))
hora = int(ahora_LA.strftime("%H"))
minutos = int(ahora_LA.strftime("%M"))
fecha_actual = ahora_LA.date()

year=fecha_actual.year
month=fecha_actual.month
day=fecha_actual.day
#dia_semana_iso = fecha_actual.isoweekday()

dia='dia'+str(day)
meses=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
cursor = conn.cursor()

def enviar_correo(destinatario,asunto,cuerpo):
    SMTP_SERVER = datos["SMTP_SERVER"]
    SMTP_PORT = datos["SMTP_PORT"]
    SMTP_USERNAME = datos["SMTP_USERNAME"]
    SMTP_PASSWORD = datos["SMTP_PASSWORD"]

    cuerpo=cuerpo.replace('* ','')
    cuerpo=cuerpo.replace('Ñ','N')
    cuerpo=cuerpo.replace('Á','A')
    cuerpo=cuerpo.replace('É','E')
    cuerpo=cuerpo.replace('Í','I')
    cuerpo=cuerpo.replace('Ó','O')
    cuerpo=cuerpo.replace('Ú','U')

    sender_mail= datos["mail_notif"]
    mensaje = MIMEMultipart()
    mensaje["From"] = sender_mail
    mensaje["To"] = destinatario
    mensaje["Subject"] = asunto
    mensaje.attach(MIMEText(cuerpo, "plain"))

    if asunto=='REPORTE DE AUSENTES':
        ruta_csv = "reporte.csv"
        with open(ruta_csv, "rb") as archivo:
            parte = MIMEBase("application", "octet-stream")
            parte.set_payload(archivo.read())
            encoders.encode_base64(parte)
            parte.add_header("Content-Disposition", f"attachment; filename={ruta_csv.split('/')[-1]}")
            mensaje.attach(parte)

    try:
        # Conectar al servidor SMTP de Amazon SES
        servidor_smtp = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        servidor_smtp.ehlo()
        servidor_smtp.starttls()  # Iniciar la conexión TLS
        servidor_smtp.ehlo()
        # Autenticarse con el servidor
        servidor_smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
        # Enviar el correo
        servidor_smtp.sendmail(sender_mail, destinatario, mensaje.as_string())
        servidor_smtp.quit()
        print("Sent\n")
    except Exception as e:
        print(f"Error al enviar el correo: {e}")

def reportes(hora_objetivo):
    archivo_csv = 'reporte.csv'
    print('\nfuncion de correo')
    entire_months=['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE']
    fecha_actual = datetime.now().date()
    year=fecha_actual.year
    month=fecha_actual.month
    day=fecha_actual.day

    conn2= sqlite3.connect('credenciales.db')
    cursor2 = conn2.cursor()
    hora_reporte=(datos['horas_reporte'][0]).split(':')
    hora_reporte=hora_reporte[0]

    turno={datetime.strptime(datos['horas_reporte'][0], "%H:%M").time():'MATUTINO',
            datetime.strptime(datos['horas_reporte'][1], "%H:%M").time():'VESPERTINO'}
    turno=turno[hora_objetivo]

    print(turno)
    cursor2.execute("SELECT matricula,nombre,grupo,turno,faltas FROM alumnos WHERE flag=0 and turno=? order by turno, grupo, nombre",(turno,))
    rows = cursor2.fetchall()
    cursor2.execute("UPDATE alumnos SET avoid_rep=0")
    cursor2.execute("UPDATE alumnos SET faltas=faltas+1 WHERE flag=0 and turno=?",(turno,))#poner falta a los alumnos que no esten presentes
    conn2.commit()

    with open(archivo_csv, mode='w', newline='') as archivo:
        escritor_csv = csv.writer(archivo)
        escritor_csv.writerow(['ALUMNOS','AUSENTES'])
        escritor_csv.writerow(['FECHA: ',f'{day} DE {entire_months[month-1]} DE {year}'])
        escritor_csv.writerow([''])
        escritor_csv.writerow(['MATRICULA','NOMBRE','GRUPO','TURNO','FALTAS ACUMULADAS'])
        for i in rows:
            escritor_csv.writerow([i[0],i[1],i[2],i[3],i[4]])

    mensaje=f'{day} DE {entire_months[month-1]} DE {year}\nTURNO: {turno}\n'

    email=list(datos['director_mail'])
    if turno=='MATUTINO':
        email.append(datos['sub_matutino'])
    else:
        email.append(datos['sub_vespertino'])
        
    for i in email:
        print('HORA: ',hora,'REPORTE DE AUSENTES')
        enviar_correo(i,"REPORTE DE AUSENTES",mensaje)
    conn2.close()

def wait(horas_objetivo):
    while True:
        ahora = datetime.now()
        date=ahora.date()
        mes=date.month
        dia=date.day
        datos_mes=calendar[meses[mes-1]]
        datos_dia=datos_mes.split(',')
        ahora = datetime.now().time()
        if int(datos_dia[dia-1])!=2:
            for hora_objetivo in horas_objetivo:
                if  ahora >= hora_objetivo and (ahora < (datetime.combine(datetime.today(), hora_objetivo) + timedelta(minutes=1)).time()):
                    reportes(hora_objetivo)
                    time.sleep(60)  # Espera un minuto para evitar múltiples interrupciones en la misma hora
            time.sleep(1)  # Espera un segundo antes de revisar nuevamente

horas_objetivo=[]

for horas in datos['horas_reporte']:
    horas_objetivo.append(datetime.strptime(horas, "%H:%M").time())

hilo_interrupcion = threading.Thread(target=wait, args=(horas_objetivo,))
hilo_interrupcion.daemon = True
hilo_interrupcion.start()

def procesar_elementos():
    conn = sqlite3.connect('credenciales.db')
    cursor = conn.cursor()
    while True:
        completo=datetime.now()
        ahora = completo.time()
        hora = int(completo.strftime("%H"))
        minutos = int(completo.strftime("%M"))
        day_1 = completo.day
        hora_reset=datetime.strptime(datos['hora_reset'], "%H:%M").time()
        if  ahora >= hora_reset and (ahora < (datetime.combine(datetime.today(), hora_reset) + timedelta(minutes=1)).time()):
            cursor.execute("UPDATE alumnos SET flag = 0, avoid_rep=0")
            print('HORA: ',hora,' TODOS LOS ALUMNOS FUERA')
            conn.commit()
            time.sleep(60)

        if not cola_alumnos.empty():
            try:
                elemento = cola_alumnos.get() 
                cursor.execute(f"SELECT flag, nombre, correo, turno,avoid_rep FROM alumnos WHERE matricula = ?",(elemento,))
                rows = cursor.fetchall()
                cursor.execute(f"SELECT {meses[month-1]} FROM meses WHERE matricula = ?",(elemento,))
                mes = cursor.fetchall()
                flag,nombre,correo_destino,turno,avoid_rep=rows[0]
                mes=mes[0][0]
                hora1,hora2=datos['horas_retardo']
                hora1=hora1.split(':'); hora2=hora2.split(':')
                print(completo, day_1, hora, minutos)
                nombre=nombre.replace(' *','')
                if avoid_rep==0:
                    if flag==0:
                        mensaje=f"{nombre} ha ingresado al plantel."
                        cursor.execute("UPDATE alumnos SET flag = ?, avoid_rep= 1 WHERE matricula = ?", (1, elemento))
                        mes=mes.split(',')            
                        if (turno=='MATUTINO' and ((int(hora)==int(hora1[0]) and minutos>=int(hora1[1])) or int(hora)>int(hora1[0]))):
                            mes[day_1-1]=str(3)
                        elif (turno=='VESPERTINO' and ((int(hora)==int(hora2[0]) and minutos>=int(hora2[1])) or int(hora)>int(hora2[0]))):
                            mes[day_1-1]=str(3)
                        else:
                            mes[day_1-1]=str(1)
                        dias=''
                        for i in mes:dias+=i+','
                        dias=dias[:-1]
                        cursor.execute(f"UPDATE meses SET {meses[month-1]} = ? WHERE matricula = ?", (dias, elemento))

                    else:
                        mensaje=f"{nombre} ha salido del plantel."
                        cursor.execute("UPDATE alumnos SET flag = ?, avoid_rep=1 WHERE matricula = ?", (0, elemento))
                    conn.commit()
                
                    if correo_destino!='test@gmail.com':
                        print(mensaje,'\t',correo_destino)
                        enviar_correo(correo_destino,"AVISO",mensaje)
                    else:
                        print(mensaje)
                else:
                    print('avoiding rep:',nombre)
            except Exception as e:
                print('error: ',e)
                
            cola_alumnos.task_done()  # Indicar que se ha procesado el elemento
        time.sleep(0.1)
    
hilo_consumidor = threading.Thread(target=procesar_elementos)
hilo_consumidor.start()

while True:
    try:
        entrada=input()
        if entrada=='exit':
            print('salir')
            break
        cola_alumnos.put(entrada)
    except:
    	print('credencial no valida')

