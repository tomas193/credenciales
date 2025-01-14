import csv
import sqlite3
from datetime import datetime
import json

with open('data.json', 'r') as archivo:
    data = json.load(archivo)

with open('calendario_escolar.json', 'r') as archivo:
    calendario = json.load(archivo)

#matricula = escuala+contador bd
escuela=data['escuela']
grupos={'A':'1','B':'2','C':'3','D':'4','E':'5','F':'6','G':'7','H':'8'}
turnos={'MATUTINO':'0','VESPERTINO':'1'}

archivo_csv = 'alumnos.csv'
datos=[]
with open(archivo_csv, mode='r') as archivo:
    lector_csv = csv.reader(archivo)
    for fila in lector_csv:
        datos.append(fila)

def registro(nombre,grupo,turno,permiso,nombre_padre,telefono,foto_id,foto_flag,avoid_rep):
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
    cursor.execute("SELECT * FROM alumnos WHERE nombre = ?",(nombre,))
    rows = cursor.fetchall()
    if len(rows)==0:
        cursor.execute("SELECT COUNT(nombre) FROM alumnos")
        total=(cursor.fetchall()[0][0])+1
        matricula=str(escuela)
        suma=len(matricula)+len(str(total))
        for i in range(0,7-suma):
            matricula+='0'
        matricula+=str(total)

        nuevo_usuario = (matricula,nombre, grupo,turno,0,0,permiso,telefono,'test@gmail.com',foto_id,foto_flag,nombre_padre,avoid_rep)
        print(matricula)
        cursor.execute('INSERT INTO alumnos (matricula,nombre,grupo,turno,flag,faltas,permiso_salida,telefono,correo,foto_id,foto_flag,nombre_padre,avoid_rep) select ?,?,?,?,?,?,?,?,?,?,?,?,?', nuevo_usuario)
        cursor.execute('INSERT INTO meses (matricula,jan,feb,mar,apr,may,jun,jul,aug,sep,oct,nov,dec) select ?,?,?,?,?,?,?,?,?,?,?,?,? ', (nuevo_usuario[0],jan,feb,mar,apr,may,jun,jul,aug,sep,oct,nov,dec))
        print('alumno registrado')
    else:
        print('alumno existente',nombre)

    conn.commit()
    conn.close()

for i in datos:
    nombre=i[0]
    nombre=nombre.replace(' /','')
    grupo=i[1].upper();turno=i[2].upper();permiso=i[3];nombre_padre=i[4].upper();telefono=i[5]

    registro(nombre,grupo,turno,permiso,nombre_padre,telefono,0,0,0)

print('registro completado')