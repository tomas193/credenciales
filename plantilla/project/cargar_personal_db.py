import csv
import sqlite3
from datetime import datetime
import json

fecha_actual = datetime.now()
hora=fecha_actual.strftime("%H")
solo_fecha = fecha_actual.date()
year=str(solo_fecha.year)
day=str(solo_fecha.day)

with open('data.json', 'r') as archivo:
    datos = json.load(archivo)

with open('calendario_escolar.json', 'r') as archivo:
    calendario = json.load(archivo)

escuela=str(datos['escuela'])

archivo_csv = 'personal.csv'
datos=[]
with open(archivo_csv, mode='r') as archivo:
    lector_csv = csv.reader(archivo)
    for fila in lector_csv:
        datos.append(fila)

def registro(nombre,foto_id):
    conn = sqlite3.connect('credenciales.db')
    cursor = conn.cursor()
    
   

    jan=calendario['jan']
    feb=calendario['feb']
    mar=calendario['mar']
    apr=calendario['apr']
    may=calendario['may']
    jun=calendario['jun']
    jul=calendario['jul']
    aug=calendario['aug']
    sep=calendario['sep']
    oct=calendario['oct']
    nov=calendario['nov']
    dec=calendario['dec']

    conn.commit()

    cursor.execute("SELECT * FROM personal WHERE nombre = ?",(nombre,))
    rows = cursor.fetchall()
    
    if len(rows)==0:
        cursor.execute("SELECT COUNT(nombre) FROM personal")
        total=(cursor.fetchall()[0][0])+1
        matricula=str(escuela)
        suma=len(matricula)+len(str(total))
        for i in range(0,7-suma):
            matricula+='0'
        matricula+=str(total)

        nuevo_usuario = (matricula,nombre, foto_id)
        cursor.execute('INSERT INTO personal (matricula,nombre,puesto) select ?,?,?', nuevo_usuario)
        cursor.execute('INSERT INTO meses (matricula,jan,feb,mar,apr,may,jun,jul,aug,sep,oct,nov,dec) select ?,?,?,?,?,?,?,?,?,?,?,?,? ', (nuevo_usuario[0],jan,feb,mar,apr,may,jun,jul,aug,sep,oct,nov,dec))
        print('docente registrado')
    else:
        print('matricula existente',nuevo_usuario)

    conn.commit()
    conn.close()

for i in datos:
    nombre=i[0]
    foto_id=i[2]
    registro(nombre,foto_id)

print('registro completado')