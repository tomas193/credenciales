from flask import Flask, request, jsonify
import sqlite3
import time
from datetime import datetime,timedelta, date

app = Flask(__name__)
DB_PATH = "credenciales.db"

# Función para ejecutar consultas
def query_db(query, args=(), one=False):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL;")  # Habilita modo WAL para concurrencia segura
    cursor = conn.cursor()
    cursor.execute(query, args)
    conn.commit()
    rows = cursor.fetchall()
    conn.close()
    return (rows[0] if rows else None) if one else rows


@app.route("/update_flag", methods=["POST"])
def update_flag():
    data = request.json
    flag = data.get("flag")
    matricula = data.get("matricula")

    if not flag or not matricula:
        return jsonify({"error": "Faltan datos"}), 400

    query_db("UPDATE alumnos SET flag = ?, avoid_rep= 1 WHERE matricula = ?", (flag, matricula))
    return jsonify({"message": "Flag Updated"}), 201
    

@app.route("/update_month", methods=["POST"])
def update_month():
    data = request.json
    dias_string = data.get("dias_string")
    matricula = data.get("matricula")

    if not flag or not matricula:
        return jsonify({"error": "Faltan datos"}), 400

    query_db(f"UPDATE meses SET {meses[mes_actual-1]} = ? WHERE matricula = ?", (dias_string, matricula))
    return jsonify({"message": "Month Updated"}), 201


@app.route("/alumnos", methods=["GET"])
def get_users():
    completo=datetime.now()
    mes_actual = completo.month
    
    matricula = request.args.get("matricula")
    meses=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
    
    if not matricula:
        return jsonify({"error": "Matrícula no proporcionada"}), 400
        
    columna_mes = meses[mes_actual - 1]
    alumno_datos = query_db("SELECT flag, nombre, correo, turno,avoid_rep FROM alumnos WHERE matricula = ?",(matricula,))
    alumno_mes = query_db(f"SELECT {columna_mes} FROM meses WHERE matricula = ?",(matricula,))
    
    return jsonify({ "datos" : alumno_datos, 
    		     "mes" : alumno_mes
    		   })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
