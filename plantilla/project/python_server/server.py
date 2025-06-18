from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os

app = Flask(__name__)
CORS(app)

@app.route('/mailScript', methods=['POST'])
def ejecutar_script():

    data = request.json
    correo = data.get('correo', 'Desconocido')
    asunto = str(data.get('asunto', 'null'))
    mensaje = str(data.get('mensaje', 'null'))

    try:
        # Ejecutar script.py y capturar salida
        resultado = subprocess.check_output(['python3', 'send_mail.py', correo, asunto, mensaje], stderr=subprocess.STDOUT)
        return jsonify({'resultado': resultado.decode('utf-8')}), 200
    
    except subprocess.CalledProcessError as e:
        return jsonify({'error': e.output.decode('utf-8')}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/generarCredencial', methods=['POST'])
def generar_credencial():
    try:
        # Ruta absoluta al script
        script_path = os.path.join(os.path.dirname(__file__), '..', 'credenciales_alumnos.py')
        
        # Verificar que el archivo existe
        if not os.path.exists(script_path):
            return jsonify({'error': 'Script no encontrado'}), 404
            
        # Ejecutar con timeout
        resultado = subprocess.check_output(
            ['python3', script_path], 
            stderr=subprocess.STDOUT,
            timeout=30,
            cwd=os.path.dirname(script_path)  # Ejecutar desde el directorio del script
        )
        return jsonify({'resultado': resultado.decode('utf-8')}), 200
        
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'El script tardó demasiado en ejecutarse'}), 408
    except subprocess.CalledProcessError as e:
        return jsonify({'error': e.output.decode('utf-8')}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
