import os
import subprocess

def habilitar_dummy_display():
    # Nombre de la salida de video
    salida_video = "HDMI-2"
    # Define el nombre y parámetros del modo que acabas de generar
    nombre_modo = "1920x1080_60.00"
    parametros_modo = "173.00 1920 2048 2248 2576 1080 1083 1088 1120 -hsync +vsync"

    try:
        # Paso 1: Crear el nuevo modo
        subprocess.run(f"xrandr --newmode {nombre_modo} {parametros_modo}", shell=True, check=True)
        # Paso 2: Agregar el modo a la salida específica
        subprocess.run(f"xrandr --addmode {salida_video} {nombre_modo}", shell=True, check=True)
        # Paso 3: Habilitar la salida con el modo
        subprocess.run(f"xrandr --output {salida_video} --mode {nombre_modo}", shell=True, check=True)
        print(f"Pantalla virtual habilitada en {salida_video} con resolución {nombre_modo}.")
    except subprocess.CalledProcessError as e:
        print("Error al habilitar la pantalla virtual:", e)

habilitar_dummy_display()
