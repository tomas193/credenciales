const fs = require('fs');

let raw = fs.readFileSync('datos_edicion.json');
let data = JSON.parse(raw);

data.SQL_COMMAND = 'nuevo valor';

fs.writeFileSync('datos_edicion.json', JSON.stringify(data, null, 2));
console.log('json actualizado');