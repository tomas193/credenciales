import sqlite3
import cv2
import os
import sqlite3
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
from barcode import ITF
from barcode.writer import ImageWriter
from datetime import datetime
import json

fecha_actual = datetime.now()
hora=fecha_actual.strftime("%H")
solo_fecha = fecha_actual.date()
month=fecha_actual.strftime("%m")
minutos = fecha_actual.strftime("%M")
year=str(solo_fecha.year)
year=year[2:4]
day=str(solo_fecha.day)

with open('data.json', 'r') as archivo:
    datos = json.load(archivo)

with open('calendario_escolar.json', 'r') as archivo:
    calendario = json.load(archivo)

#0 PUEDE SALIR
#1 NO PUEDE SALIR 

def update_db(matricula):
    try:
        foto_id=int(input('NUMERO DE FOTO: '))
        num=''
        for k in range(0,4-len(str(foto_id))):num+='0'
        num+=str(foto_id)
    except: print("NUMERO NO VALIDO")
    cursor.execute("UPDATE alumnos SET foto_id = ?, foto_flag=? WHERE matricula = ?", (num,1, matricula))
    conn.commit()

def tomarfotos():
    turno={'M':'MATUTINO','V':'VESPERTINO'}
    while True:
        grupo=input('\nSELECCIONE UN GRUPO: ').upper()
        if len(grupo)==3:
            turno=turno[grupo[2:]]
            cursor.execute("SELECT * FROM alumnos WHERE grupo = ? and foto_flag=? and turno=?",(grupo[:2],0,turno))
            rows = cursor.fetchall()
            while rows:
                actual=rows.pop(0)
                print('\nALUMNO: ',actual[2],end='')
                if len(rows)>0:
                    siguiente=rows[0]
                    print('\t\t->\t\tSIGUIENTE: ', siguiente[2])
                else:
                    siguiente='NINGUN ALUMNO RESTANTE'
                    print(siguiente)
                seleccion=input('Y (tomar foto)  N (omitir)  X (regresar)  Q (eliminar de la lista):  ').upper()
                if seleccion=='Y': update_db(actual[1])
                elif seleccion=='N':rows.append(actual)
                elif seleccion=='Q':
                    try:
                        pregunta=input(f'\nESTA SEGURO DE ELIMINR A {actual[2]}?\tY/N: ').upper()
                        if pregunta=='Y':
                            eliminar_alumno(actual[2])
                    except Exception as e:
                        print(e)

                elif seleccion=='X': 
                    return
                else: print('SELECCION INVALIDA')

        if grupo=='X': break

def registro(nombre,grupo,turno,permiso,nombre_padre,telefono,foto_id,foto_flag,avoid_rep):
    turnos={'0':'MATUTINO','1':'VESPERTINO'}
    escuela=str(datos['escuela'])

    jan=calendario['jan'] ;feb=calendario['feb']; mar=calendario['mar']; apr=calendario['apr']
    may=calendario['may']; jun=calendario['jun']; jul=calendario['jul']; aug=calendario['aug']
    sep=calendario['sep']; oct=calendario['oct']; nov=calendario['nov']; dec=calendario['dec']

    conn.commit()
    cursor.execute("SELECT * FROM alumnos WHERE nombre = ?",(nombre,))
    rows = cursor.fetchall()

    cursor.execute("SELECT COUNT(nombre) FROM alumnos")
    total=(cursor.fetchall()[0][0])+1
    matricula=str(escuela)
    suma=len(matricula)+len(str(total))
    for i in range(0,7-suma):
        matricula+='0'
    matricula+=str(total)

    nuevo_usuario = (matricula,nombre, grupo,turnos[turno],0,0,permiso,telefono,'test@gmail.com',foto_id,foto_flag,nombre_padre,avoid_rep)
    if len(rows)==0:
        cursor.execute('INSERT INTO alumnos (matricula,nombre,grupo,turno,flag,faltas,permiso_salida,telefono,correo,foto_id,foto_flag,nombre_padre,avoid_rep) select ?,?,?,?,?,?,?,?,?,?,?,?,?', nuevo_usuario)
        cursor.execute('INSERT INTO meses (matricula,jan,feb,mar,apr,may,jun,jul,aug,sep,oct,nov,dec) select ?,?,?,?,?,?,?,?,?,?,?,?,? ', (matricula,jan,feb,mar,apr,may,jun,jul,aug,sep,oct,nov,dec))
        print('alumno registrado')
    else:
        print('matricula existente',rows[0])

    conn.commit()
    conn.close()

def generate_cards():
    print('generating card...')

def registrar_alumno():
    turnos={'M':'0','V':'1'}
    apellidos=str(input('APELLIDOS: ')).upper()
    nombre=str(input('NOMBRE: ')).upper()
    grupo=str(input('GRUPO: ')).upper()
    turno=turnos[grupo[2]]
    toma_foto=str(input('TOMA DE FOTO? (Y/N): ')).upper()
    if toma_foto=='Y':
        foto_flag=1
        foto_id=int(input('NUMERO DE FOTO: '))
    else:
        foto_flag=0
        foto_id=0

    permiso=0

    try:
        registro(apellidos+' * '+nombre,grupo[:2],turno,permiso,'-',0,foto_id,foto_flag,0)
    except Exception as e:
        print('error: ',e)

def eliminar_alumno(nombre):
    cursor.execute('SELECT * from alumnos where nombre=?',(nombre,))
    rows=cursor.fetchall()
    try:
        print(rows)
        if len(rows)>0:
            cursor.execute('DELETE from alumnos where nombre=?',(nombre,))
            conn.commit()
            print('ALUMNO ELIMINADO EXITOSAMENTE')
        else:
            print('ALUMNO INEXISTENTE')
    except Exception as e:
        print('ERROR: ',e)

def actualizar_datos():
    nombre=str(input('INGRESE UN NOMRBE A BUSCAR: ')).upper()
    cursor.execute("SELECT * FROM alumnos WHERE nombre=?", (nombre,))
    rows=cursor.fetchall()
    print(rows)
    if len(rows)>0:
        opciones={1:'nombre',2:'grupo',3:'turno',4:'permiso_salida',5:'correo',6:'foto_id'}
        while True:
            print('1-NOMBRE\t2-GRUPO\t3-TURNO\t4-PERMISO DE SALIDA\t5-CORREO\t6-FOTO ID\t7-SALIDA')
            try:
                opcion=int(input('ESCOJA UNA OPCION: '))
                if opcion==7:break
                else:
                    cambio=input(f'NUEVO {opciones[opcion]}: ').upper()
                    cursor.execute(f'UPDATE alumnos SET {opciones[opcion]}=? where nombre=?',(cambio,nombre,))
                    conn.commit()
            except:
                print('OPCION INVALIDA')

def consulta():
    apellidos=str(input('APELLIDOS: ')).upper()
    cursor.execute("SELECT * FROM alumnos WHERE nombre LIKE ?", (f'%{apellidos}%',))
    rows=cursor.fetchall()
    for i in rows:
        print(i)

while True:
    conn = sqlite3.connect('credenciales.db')
    cursor = conn.cursor()
    try:
        select=int(input('\n1-TOMAR FOTOS\t2-GENERAR CREDENCIALES\t3-CONSULTA\t4-REGISTRAR ALUMNO\t5-ACTUALIZAR DATOS\t6-ELIMINAR ALUMNO\t7-SALIR\nSELECCIONE UNA OPCION: '))
        if select==1:
            tomarfotos()
        elif select==2:
            generate_cards()
        elif select==3:
            consulta()
        elif select==4:
            registrar_alumno()
        elif select==5:
            actualizar_datos()
        elif select==6: 
            nombre=str(input('NOMBRE COMPLETO DEL ALUMNO A ELIMINAR: ')).upper()
            eliminar_alumno(nombre)
        elif select==7:
            break
    except:
        print('INGRESE UNA OPCION VÁLIDA\n')