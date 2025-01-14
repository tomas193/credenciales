import csv
import sqlite3

conn = sqlite3.connect('credenciales.db')
cursor = conn.cursor()

archivo_csv = 'contacto.csv'
datos=[]
with open(archivo_csv, mode='r', encoding='latin-1') as archivo:
    lector_csv = csv.reader(archivo)
    
    for fila in lector_csv:
        datos.append(fila)

for i in datos:
    cursor.execute("UPDATE alumnos SET correo = ? WHERE matricula = ?", (i[1], i[0]))
    conn.commit()
    print(i)

print('correos registrados')
conn.close()

