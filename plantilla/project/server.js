//Programa Desarrollado por Jorge Tomás Araujo González
var express=require('express');
const multer = require('multer'); //carga de archivos
const sqlite3 = require('sqlite3'); //libreria base de datos
var server=express()

server.use(express.urlencoded({ extended: true })) //procesar correctamente los datos codificados en URL
server.use(express.static('public')); //carpeta principal: public

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

server.post('/update_assistance', (req, res) => {
  const { flag, matricula } = req.body;
  db.run(`UPDATE alumnos SET flag = ? WHERE matricula = ?`, [flag, matricula], function(err) {
      if (err) {
          return res.status(500).send(err.message);
      }
      res.send(`Filas afectadas: ${this.changes}`);
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

server.listen(80,function(){
	console.log('server corriendo');
});
