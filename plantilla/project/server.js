//Programa Desarrollado por Jorge Tomás Araujo González
var express=require('express');
const multer = require('multer'); //carga de archivos
const sqlite3 = require('sqlite3'); //libreria base de datos
var server=express()
const fs = require('fs');

let raw = fs.readFileSync('datos_edicion.json');
let calendario = fs.readFileSync('calendario_escolar.json');

server.use(express.urlencoded({ extended: true })) //procesar correctamente los datos codificados en URL
server.use(express.static('public')); //carpeta principal: public
server.use('/id_matricula', express.static('id_matricula'));


// Configura la conexión a la base de datos
const db = new sqlite3.Database('credenciales.db');

server.get('/api/alumnos', (req, res) => {
  // Ejecuta una consulta SQL para obtener datos de la tabla chart
  db.all('SELECT * FROM alumnos', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error en la base de datos' });
      return;
    }
    res.send(rows);
  });
});

server.get('/api/meses', (req, res) => {
  db.all('SELECT * FROM MESES', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error en la base de datos' });
      return;
    }
    res.send(rows);
  });
});

server.get('/api/alumnos_mas_faltas', (req, res) => {
  db.all("SELECT nombre,matricula, grupo, turno, faltas FROM alumnos WHERE (turno = 'MATUTINO' AND faltas = (SELECT MAX(faltas) FROM alumnos WHERE turno = 'MATUTINO')) OR (turno = 'VESPERTINO' AND faltas = (SELECT MAX(faltas) FROM alumnos WHERE turno = 'VESPERTINO'))", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error en la base de datos' });
      return;
    }
    res.send(rows);
  });
});

server.get('/api/faltas_turnos', (req, res) => {
  db.all("SELECT turno, SUM(faltas) AS total_faltas FROM alumnos WHERE turno='MATUTINO' or turno='VESPERTINO' GROUP by turno", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error en la base de datos' });
      return;
    }
    res.send(rows);
  });
});

server.get('/api/faltas_mat', (req, res) => {
  db.all("SELECT grupo, SUM(faltas) AS total_faltas FROM alumnos WHERE (grupo LIKE '1%' OR grupo LIKE '2%' OR grupo LIKE '3%') AND turno = 'MATUTINO' GROUP BY grupo", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error en la base de datos' });
      return;
    }
    res.send(rows);
  });
});

server.get('/api/faltas_ves', (req, res) => {
  db.all("SELECT grupo, SUM(faltas) AS total_faltas FROM alumnos WHERE (grupo LIKE '1%' OR grupo LIKE '2%' OR grupo LIKE '3%') AND turno = 'VESPERTINO' GROUP BY grupo", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error en la base de datos' });
      return;
    }
    res.send(rows);
  });
});

server.get('/api/test', (req, res) => {
  db.all("SELECT nombre,matricula,grupo,turno,flag,faltas FROM alumnos order by turno, grupo, nombre", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error en la base de datos' });
      return;
    }
    res.send(rows);
  });
});

server.get('/api/personal', (req, res) => {
  db.all("SELECT nombre, MIN(id) as id, puesto, matricula FROM personal WHERE puesto IS NOT NULL AND puesto != '' GROUP BY nombre;", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error en la base de datos' });
      return;
    }
    res.send(rows);
  });
});

server.get('/api/last_id', (req, res) => {
  db.all("select id from alumnos order by id desc limit 1", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error en la base de datos' });
      return;
    }
    res.send(rows);
  });
});

server.post('/probar_url', (req, res) => {
  const {query} = req.body;
  let data = JSON.parse(raw);
  
  data.SQL_COMMAND = query;
  
  fs.writeFileSync('datos_edicion.json', JSON.stringify(data, null, 2));
  console.log('json actualizado');
});

server.post('/registrar_alumno', (req, res) => {
    // Remove unused query extraction
    let data = JSON.parse(calendario);
    const meses_calendario = [
        data.jan,
        data.feb,
        data.mar,
        data.apr,
        data.may,
        data.jun,
        data.jul,
        data.aug,
        data.sep,
        data.oct,
        data.nov,
        data.dec
    ];
    
    const { matricula, nombre, grupo, turno, telefono, correo, padre } = req.body;
    
    // Use a transaction to ensure both inserts succeed or both fail
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        
        // Insert student data
        db.run(
            "INSERT INTO alumnos (matricula, nombre, grupo, turno, flag, faltas, permiso_salida, telefono, correo, foto_id, foto_flag, nombre_padre, avoid_rep) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [matricula, nombre, grupo, turno, 0, 0, 0, telefono, correo, 0, 0, padre, 0],
            function (err) {
                if (err) {
                    console.error('Error inserting student:', err);
                    db.run("ROLLBACK");
                    res.status(500).json({ error: 'Error en la base de datos al registrar alumno' });
                    return;
                }
                
                // Insert months data - fix the parameters array
                db.run(
                    "INSERT INTO meses (matricula, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [matricula, ...meses_calendario], // Include matricula as first parameter
                    function (err) {
                        if (err) {
                            console.error('Error inserting months:', err);
                            db.run("ROLLBACK");
                            res.status(500).json({ error: 'Error en la base de datos al registrar calendario' });
                            return;
                        }
                        
                        // Commit transaction and send success response
                        db.run("COMMIT");
                        res.json({ 
                            success: true, 
                            message: 'Alumno registrado exitosamente',
                            student_rows: 1,
                            calendar_rows: 1
                        });
                    }
                );
            }
        );
    });
});

server.post('/update_assistance', (req, res) => {
  const { flag, matricula } = req.body;
  db.run(`UPDATE alumnos SET flag = ? WHERE matricula = ?`, [flag, matricula], function(err) {
      if (err) {
          return res.status(500).send(err.message);
      }
      res.send(`Filas afectadas: ${this.changes}`);
  });
});

server.post('/actualizar_datos_alumno', (req, res) => {
  const { grupo, turno, telefono, correo, matricula } = req.body;
  db.run(`UPDATE alumnos SET grupo = ?, turno = ?, telefono = ?, correo = ? WHERE matricula = ?`, [grupo, turno, telefono, correo, matricula], function(err) {
      if (err) {
          return res.status(500).send(err.message);
      }
      res.send(`Filas afectadas: ${this.changes}`);
  });
});

server.post('/eliminar_alumno', (req, res) => {
  const { matricula } = req.body;
  db.run(`DELETE from alumnos WHERE matricula = ?`, [matricula], function(err) {
      if (err) {
          return res.status(500).send(err.message);
      }
      res.send(`Alumno eliminado: ${this.changes}`);
  });
});

let meses=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

server.post('/update_dia', (req, res) => {
  const mes=req.body.mes;
  const string=req.body.string;
  const matricula=req.body.matricula;

  db.run(`UPDATE meses SET ${meses[mes]} = ? WHERE matricula = ?`, string, matricula, function(err) {
      if (err) {
          return res.status(500).send(err.message);
      }
      res.send(`Filas afectadas: ${this.changes}`);
  });
});

server.get('/',function(req,res){
	res.sendFile(__dirname+'/'+'home.html');	
});

server.get('/stats',function(req,res){
	res.sendFile(__dirname+'/'+'general_stats.html');	
});

server.get('/asistencia',function(req,res){
	res.sendFile(__dirname+'/'+'asistencia.html');	
});

server.get('/registro',function(req,res){
	res.sendFile(__dirname+'/'+'registrar_alumno.html');	
});

server.get('/aviso',function(req,res){
	res.sendFile(__dirname+'/'+'aviso.html');	
});

server.get('/personal',function(req,res){
	res.sendFile(__dirname+'/'+'personal.html');	
});


server.listen(3000, '127.0.0.1',function(){
	console.log('Servidor Corriendo');
});
