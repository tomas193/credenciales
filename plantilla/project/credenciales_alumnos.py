import cv2
import os
import sqlite3
import numpy as np
import json
from PIL import Image, ImageDraw, ImageFont
from barcode import Code128
from barcode.writer import ImageWriter

conn = sqlite3.connect('credenciales.db')
cursor = conn.cursor()

with open('datos_edicion.json', 'r') as archivo:
    edicion = json.load(archivo)

carpeta = 'fotos_camara'
# Obtener una lista de todos los archivos en la carpeta
archivos = os.listdir(carpeta)

writer_options = {
    "module_width": 0.3,  # Ancho de cada barra (aumentar si es necesario)
    "module_height": 30,  # Altura de las barras
    "quiet_zone": 4,    # Espaciado alrededor del código
    "font_size": 7,      # Tamaño del texto debajo del código
    "text_distance": 1,   # Distancia entre el texto y las barras
}

def barras(codigo):
    # Crear el objeto de código de barras Code 39
    codigo_barras = Code128(codigo, writer=ImageWriter())
    nombre_archivo = 'codigo_barras'
    archivo_imagen = codigo_barras.save(nombre_archivo,options=writer_options)

def marco(permit,turno,grupo,nombre,matricula):
    imagen = Image.open("res1.jpg")
    dibujar = ImageDraw.Draw(imagen)
    coordenadas = edicion['coordenadas_marco_foto']
    if permit==1:
        dibujar.rectangle(coordenadas, outline="red", width=10)
    else:
        dibujar.rectangle(coordenadas, outline=(144, 238, 144), width=10)
    
    ruta_id_matricula = os.path.join(f"id_matricula", f'{matricula}.png')
    ruta_completa = os.path.join(f"credenciales",turno,grupo, f'{nombre}.png')
    imagen.save(ruta_completa)
    imagen.save(ruta_id_matricula)

def recorte():
    imagen = Image.open('codigo_barras.png')
    caja_recorte = (25, 0, 400, 200)
    imagen_recortada = imagen.crop(caja_recorte)
    imagen_recortada.save('codigo_barras.png')

def escribir_datos(matricula,nombre,grupo,turno):
    imagen = cv2.imread('res1.jpg')

    # Verificar que la imagen se haya cargado correctamente
    if imagen is None:
        print("Error: No se puede cargar la imagen")
        exit()

    # Dimensiones de la imagen
    height, width, _ = imagen.shape

    # Convertir la imagen de OpenCV (BGR) a PIL (RGB)
    imagen_pil = cv2.cvtColor(imagen, cv2.COLOR_BGR2RGB)
    imagen_pil = Image.fromarray(imagen_pil)

    # Dibujar sobre la imagen usando PIL
    draw = ImageDraw.Draw(imagen_pil)
    font_path = '/usr/share/fonts/truetype/crosextra/Carlito-Regular.ttf'  # Ruta a la fuente Calibri
    font_size = edicion['letra_info_size']
    font = ImageFont.truetype(font_path, font_size)

    font_size = edicion['letra_nombre_size']
    font_name = ImageFont.truetype(font_path, font_size)

    # Coordenadas del texto
    text = matricula
    text_position = edicion['posicion_matricula']
    text_color = (0, 0, 0)  # Color azul en formato RGB

    grup_pos = edicion['posicion_grupo']
    turno_pos=edicion['posicion_turno']

    nombre=nombre.split('* ')
    name1=nombre[0]
    name2=nombre[1]

    name_pos1 = edicion['posicion_apellidos']
    name_pos2=edicion['posicion_nombre']

    # Dibujar el texto varias veces ligeramente desplazado para hacerlo más grueso
    for offset in range(-1, 1):
        draw.text((text_position[0] + offset, text_position[1]), text, font=font, fill=text_color)
        draw.text((text_position[0], text_position[1] + offset), text, font=font, fill=text_color)
        draw.text((text_position[0] + offset, text_position[1] + offset), text, font=font, fill=text_color)
    
    for offset in range(-1, 1):
        draw.text((grup_pos[0] + offset, grup_pos[1]), grupo, font=font, fill=text_color)
        draw.text((grup_pos[0], grup_pos[1] + offset), grupo, font=font, fill=text_color)
        draw.text((grup_pos[0] + offset, grup_pos[1] + offset), grupo, font=font, fill=text_color)
    
    for offset in range(-1, 1):
        draw.text((turno_pos[0] + offset, turno_pos[1]), turno, font=font, fill=text_color)
        draw.text((turno_pos[0], turno_pos[1] + offset), turno, font=font, fill=text_color)
        draw.text((turno_pos[0] + offset, turno_pos[1] + offset), turno, font=font, fill=text_color)

    for offset in range(-1, 1): #nombres
        draw.text((name_pos1[0] + offset, name_pos1[1]), name1, font=font_name, fill=text_color)
        draw.text((name_pos1[0], name_pos1[1] + offset), name1, font=font_name, fill=text_color)
        draw.text((name_pos1[0] + offset, name_pos1[1] + offset), name1, font=font_name, fill=text_color)

    for offset in range(-1, 1): #apellidos
        draw.text((name_pos2[0] + offset, name_pos2[1]), name2, font=font_name, fill=text_color)
        draw.text((name_pos2[0], name_pos2[1] + offset), name2, font=font_name, fill=text_color)
        draw.text((name_pos2[0] + offset, name_pos2[1] + offset), name2, font=font_name, fill=text_color)

    imagen = cv2.cvtColor(np.array(imagen_pil), cv2.COLOR_RGB2BGR)
    cv2.imwrite('res1.jpg', imagen)

def pegar(fondo,foto,resize,offset,flag):
    background = cv2.imread(f'{fondo}')
    overlay = cv2.imread(f'{foto}', cv2.IMREAD_UNCHANGED)
    
    if background is None or overlay is None:
        print("Error al cargar las imágenes")
        exit()

    overlay = cv2.resize(overlay, resize)
    overlay_height, overlay_width = overlay.shape[:2]

    x_offset = offset[0]
    y_offset = offset[1]

    if overlay.shape[2] == 4:
        b, g, r, a = cv2.split(overlay)

        overlay_mask = cv2.merge((b, g, r, a))

        background_subsection = background[y_offset:y_offset+overlay_height, x_offset:x_offset+overlay_width]
        background_subsection = cv2.bitwise_and(background_subsection, background_subsection, mask=cv2.bitwise_not(a))

        combined = cv2.add(background_subsection, overlay_mask)
        combined = cv2.add(combined, overlay_mask)

        background[y_offset:y_offset+overlay_height, x_offset:x_offset+overlay_width] = combined

    else:
        background[y_offset:y_offset+overlay_height, x_offset:x_offset+overlay_width] = overlay

    if flag=='pegar': 
        cv2.imwrite('res1.jpg', background)
    if flag=='centrar':
        cv2.imwrite(foto, background)

cursor.execute(edicion['SQL_COMMAND'])
rows = cursor.fetchall()

for i in rows:
    print(i)
    nombre=i[2]
    grupo=i[3]; turno=i[4]; matricula=i[1]; permiso_salida=i[7]
    print(nombre, grupo) 
    
    try:
        
        ruta = os.path.join(carpeta, archivos[int(i[10])-1])
        imagen = cv2.imread(ruta)
        alto, ancho = imagen.shape[:2]
        fondo_blanco = cv2.imread('fondo_blanco.jpg')
        fy,fx=fondo_blanco.shape[:2]
        x,y=[(fx-ancho)//2, (fy-alto)//2]
        
        pegar('fondo_blanco.jpg',ruta,(ancho-15, alto-15),(x,y),'centrar')

        imagen = cv2.imread(ruta)
        y1,y2,x1,x2=edicion['area_recorte']
        recorte_img = imagen[y1:y2, x1:x2]
        dimensiones = edicion['resize_foto_carpeta']
        imagen_redimensionada = cv2.resize(recorte_img, dimensiones)
        imagen_pil = Image.fromarray(imagen_redimensionada)
        ruta_public=os.path.join(f"public", f'{matricula}.png')
        cv2.imwrite(ruta_public, imagen_redimensionada)

    except Exception as e:
        #print(e)
        ruta_public=os.path.join(f"public", f'{1}.jpg')
        print('foto camara no encontrada')
    
    #generar credencial
    barras(matricula)
    recorte()
    pegar('plantilla.png','codigo_barras.png',edicion['resize_codigo_barras'],edicion['coordenadas_codigo_barras'],'pegar') 
    pegar('res1.jpg',ruta_public,edicion['resize_foto_credencial'],edicion['coordenadas_foto_credencial'],'pegar') 
    escribir_datos(matricula,nombre,grupo,turno) #escribir los datos del alumno en credencial
    nombre=nombre.replace('* ','')
    nombre=nombre.replace('Ñ','N')
    nombre=nombre.replace('Á','A')
    nombre=nombre.replace('É','E')
    nombre=nombre.replace('Í','I')
    nombre=nombre.replace('Ó','O')
    nombre=nombre.replace('Ú','U')

    if edicion['marco']=='Y':
        marco(permiso_salida,turno,grupo,nombre,matricula) #colorear marco de la foto 
    else:
        imagen = Image.open("res1.jpg")
        ruta_id_matricula = os.path.join(f"id_matricula", f'{matricula}.png')
        ruta_completa = os.path.join(f"credenciales",turno,grupo, f'{nombre}.png')
        imagen.save(ruta_completa)
        imagen.save(ruta_id_matricula)

    ruta_grupos = os.path.join(f"fotos_grupos",turno,grupo, f'{nombre}.png')
    cv2.imwrite(ruta_grupos, imagen_redimensionada)

print('done')

