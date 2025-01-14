import sqlite3

# Conectar a la base de datos (se creará si no existe)
conn = sqlite3.connect('credenciales.db')

# Crear un cursor para interactuar con la base de datos
cursor = conn.cursor()

cursor.execute('''
    CREATE TABLE IF NOT EXISTS alumnos (
        id INTEGER PRIMARY KEY,
        matricula TEXT NOT NULL,
        nombre TEXT NOT NULL,
        grupo TEXT NOT NULL,
        turno TEXT NOT NULL,
        flag INTEGER NOT NULL,
        faltas INTEGER NOT NULL,
        permiso_salida INTEGER,
        telefono INTEGER,
        correo TEXT,
        foto_id TEXT,
        foto_flag INTEGER NOT NULL, 
        nombre_padre TEXT,
        avoid_rep INTEGER NOT NULL
    )
''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS personal (
        id INTEGER PRIMARY KEY,
        matricula TEXT NOT NULL,
        nombre TEXT NOT NULL,
        puesto TEXT NOT NULL
    )
''')

cursor.execute('''
        CREATE TABLE IF NOT EXISTS meses(
        id INTEGER PRIMARY KEY,
        matricula TEXT NOT NULL,
        jan TEXT NOT NULL,
        feb TEXT NOT NULL,
        mar TEXT NOT NULL,
        apr TEXT NOT NULL,
        may TEXT NOT NULL,
        jun TEXT NOT NULL,
        jul TEXT NOT NULL,
        aug TEXT NOT NULL,
        sep TEXT NOT NULL,
        oct TEXT NOT NULL,
        nov TEXT NOT NULL,
        dec TEXT NOT NULL
    )
''')

# Guardar los cambios y cerrar la conexión
conn.commit()
conn.close()

print("Base de datos creada exitosamente.")

