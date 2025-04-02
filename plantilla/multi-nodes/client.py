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
from datetime import datetime,timedelta, date
import queue
import pytz
import requests

with open('data.json', 'r') as archivo:
    datos = json.load(archivo)

with open('url.json', 'r') as archivo:
    server_url = json.load(archivo)

meses=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']

cola_alumnos=queue.Queue()

print("Servidor Cliente")


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


def procesar_elementos():
    url = server_url["url"]
    query_data_url = server_url["query"]
    update_flag_url = server_url["flag"]
    update_month_url = server_url["month"]
    
    while True:
        completo=datetime.now()
        ahora = completo.time()
        hora = int(completo.strftime("%H"))
        minutos = int(completo.strftime("%M"))
        mes_actual = completo.month
        day_1 = completo.day

        if not cola_alumnos.empty():
            try:
                matricula = cola_alumnos.get() 
                alumno = {"matricula": int(matricula)}
                consulta = requests.get(query_data_url, params=alumno)
                
                datos_alumno = consulta.json()
                datos_alumno = datos_alumno["datos"][0]

                flag,nombre,correo_destino,turno,avoid_rep = datos_alumno
                mes = consulta.json()
                mes = mes["mes"][0][0]

                hora1,hora2=datos['horas_retardo']
                hora1=hora1.split(':'); hora2=hora2.split(':')

                if avoid_rep==0:
                    if flag==0:
                        mensaje=f"{nombre} ha ingresado al plantel."
                        
                        alumno["flag"] = 1 
                        update_flag = requests.post(update_flag_url, json=alumno)

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
                        print(dias)
                        alumno["dias_string"] = dias
                        update_month = requests.post(update_month_url, json=alumno)
                        

                    else:
                        mensaje=f"{nombre} ha salido del plantel."
                        alumno["flag"] = 0
                        update_flag = requests.post(update_flag_url, json=alumno)
                
                    if correo_destino!='test@gmail.com':
                        print(mensaje, '\t', ahora,'\t' ,correo_destino)
                        enviar_correo(correo_destino,"AVISO",mensaje)
                    else:
                        print(mensaje, ahora)
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

