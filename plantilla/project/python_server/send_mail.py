import subprocess
import sys
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import json
import pytz

with open('../data.json', 'r') as archivo:
    datos = json.load(archivo)

correo_destino = sys.argv[1]
asunto = sys.argv[2]
mensaje = sys.argv[3]

#correo_destino = "ingtom91@gmail.com"
#asunto = "prueba"
#mensaje = "cuerpo del correo."

SMTP_SERVER = datos["SMTP_SERVER"]
SMTP_PORT = datos["SMTP_PORT"]
SMTP_USERNAME = datos["SMTP_USERNAME"]
SMTP_PASSWORD = datos["SMTP_PASSWORD"]

cuerpo=mensaje.replace('* ','')
cuerpo=mensaje.replace('Ñ','N')
cuerpo=mensaje.replace('Á','A')
cuerpo=mensaje.replace('É','E')
cuerpo=mensaje.replace('Í','I')
cuerpo=mensaje.replace('Ó','O')
cuerpo=mensaje.replace('Ú','U')

sender_mail= datos["mail_notif"]
mensaje = MIMEMultipart()
mensaje["From"] = sender_mail
mensaje["To"] = correo_destino
mensaje["Subject"] = asunto
mensaje.attach(MIMEText(cuerpo, "plain"))

comando = f'echo "Correo enviado.\n{correo_destino}"; exec bash'

def print_log():
    subprocess.Popen([
        "gnome-terminal",
        "--",
        "bash",
        "-c",
        comando
    ])

try:
    # Conectar al servidor SMTP de Amazon SES
    servidor_smtp = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
    servidor_smtp.ehlo()
    servidor_smtp.starttls()  # Iniciar la conexión TLS
    servidor_smtp.ehlo()
    # Autenticarse con el servidor
    servidor_smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
    # Enviar el correo
    servidor_smtp.sendmail(sender_mail, correo_destino, mensaje.as_string())
    servidor_smtp.quit()
    #print_log()

except Exception as e:
    print(f"Error al enviar el correo: {e}")


