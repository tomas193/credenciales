import cv2
import os
import sqlite3
import json
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from barcode import ITF
from barcode.writer import ImageWriter

conn = sqlite3.connect('credenciales.db')
cursor = conn.cursor()

with open('datos_edicion.json', 'r') as archivo:
    edicion = json.load(archivo)

cursor.execute("SELECT * FROM personal WHERE puesto!='' ")
rows = cursor.fetchall()

carpeta = 'fotos_camara'
# Obtener una lista de todos los archivos en la carpeta
archivos = os.listdir(carpeta)

def barras(codigo):
    # Crear el objeto de código de barras Code 39
    codigo_barras = ITF(codigo, writer=ImageWriter())

    # Guardar el código de barras en un archivo de imagen
    nombre_archivo = 'codigo_barras'
    archivo_imagen = codigo_barras.save(nombre_archivo)

def recorte():
    imagen = Image.open('codigo_barras.png')
    caja_recorte = (25, 0, 400, 200)
    imagen_recortada = imagen.crop(caja_recorte)
    imagen_recortada.save('codigo_barras.png')

def escribir_datos(matricula,nombre):
    imagen = cv2.imread('res1.jpg')
    nombre_completo=nombre

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
    font_path = 'ruta/a/tu/calibri.ttf'  # Ruta a la fuente Calibri
    font_size = edicion['letra_info_size']
    font = ImageFont.truetype(font_path, font_size)

    font_size = edicion['letra_nombre_size']
    font_name = ImageFont.truetype(font_path, font_size)

    # Coordenadas del texto
    text = matricula
    text_position = edicion['posicion_matricula']
    text_color = (0, 0, 0)  # Color azul en formato RGB

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

    carpeta = f"credenciales\PERSONAL"
    print(nombre_completo)
    ruta_completa = os.path.join(carpeta, f'{nombre_completo}.png')
    cv2.imwrite(ruta_completa, imagen)

def pegar(fondo,foto,resize,offset):
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

    cv2.imwrite('res1.jpg', background)

for i in rows:
    nombre=i[2]; foto_id=i[3]; matricula=i[1]

    ruta=os.path.join(carpeta, archivos[int(foto_id)-1])
    imagen = cv2.imread(ruta)

    recorte_img = edicion['area_recorte']
    dimensiones = edicion['resize_foto_carpeta']
    imagen_redimensionada = cv2.resize(recorte_img, dimensiones)
    
    ruta_public=os.path.join(f"public", f'{matricula}.png')
    cv2.imwrite(ruta_public, imagen_redimensionada)

    barras(matricula)
    recorte()
    pegar('plantilla_docente.jpeg','codigo_barras.png',edicion['resize_codigo_barras'],edicion['coordenadas_codigo_barras'])
    pegar('res1.jpg',ruta_public,edicion['resize_foto_credencial'],edicion['coordenadas_foto_credencial'])
    escribir_datos(matricula,nombre)

    nombre=nombre.replace('* ','')
    nombre=nombre.replace('Ñ','N')
    nombre=nombre.replace('Á','A')
    nombre=nombre.replace('É','E')
    nombre=nombre.replace('Í','I')
    nombre=nombre.replace('Ó','O')
    nombre=nombre.replace('Ú','U')

    ruta_grupos = os.path.join(f"fotos_personal", f'{nombre}.png')
    cv2.imwrite(ruta_grupos, imagen_redimensionada)

print('done')

