var nombre_alumno_nuevo = document.getElementById('registro_nombre');
var apellido_alumno_nuevo = document.getElementById('registro_apellido');
var grupo_alumno_nuevo = document.getElementById('grupo_alumno_nuevo');
var turno_alumno_nuevo = document.getElementById('turno_alumno_nuevo');
var telefono_alumno_nuevo = document.getElementById('registro_telefono');
var correo_alumno_nuevo = document.getElementById('registro_correo');
var boton_registrar_alumno = document.getElementById('guardar_alumno');
var padre_alumno_nuevo = document.getElementById('padre_alumno_nuevo');
const input = document.getElementById('inputImagen');
const vistaPrevia = document.getElementById('vistaPrevia');
let last_id;
let matricula_alumno_nuevo;
let nombre_completo;

$(document).ready(function() {

    input.addEventListener('change', function() {
        const archivo = this.files[0];
        if (archivo) {
        const lector = new FileReader();
        lector.onload = function(e) {
            vistaPrevia.src = e.target.result;
            vistaPrevia.style.display = 'block';
        };
        lector.readAsDataURL(archivo);
        }
    });

    $(boton_registrar_alumno).click(async function(){
        last_id = await get_last_id();
        generar_matricula();
        registrar_alumno();
        alert(nombre_completo.replace(" *","") + ' registrado exitosamente.')
        limpiar_entrada();
    });

});

function limpiar_entrada(){
    nombre_alumno_nuevo.value = "";
    apellido_alumno_nuevo.value = "";
    telefono_alumno_nuevo.value = "";
    correo_alumno_nuevo.value = "test@gmail.com";
    padre_alumno_nuevo.value = "";
    location.reload();
}

function registrar_alumno(){
    nombre_completo = `${apellido_alumno_nuevo.value.toUpperCase()} * ${nombre_alumno_nuevo.value.toUpperCase()}`; 

    $.post('/registrar_alumno', {
        nombre: nombre_completo,
        matricula: matricula_alumno_nuevo,
        grupo:grupo_alumno_nuevo.value,
        turno: turno_alumno_nuevo.value,
        telefono: telefono_alumno_nuevo.value,
        correo: correo_alumno_nuevo.value,
        padre: padre_alumno_nuevo.value.toUpperCase()
    }, function() {});
}

function generar_matricula(){
    let string_escuela = String(escuela);
    matricula_alumno_nuevo = string_escuela;
    let id = String(parseInt(last_id) + 1);
    let iteraciones = 7 - string_escuela.length - id.length;
    for (let i=0; i<iteraciones; i++) { matricula_alumno_nuevo += 0; }
    matricula_alumno_nuevo += id;
}

function get_last_id(){
    return axios.get('/api/last_id')
        .then(response => {

        const filasFiltradas = response.data;
        const primerFila = filasFiltradas[0];

        const id = [primerFila.id];

        return id;
        })
        .catch(error => {
        console.error('There was an error!', error);
        throw error;
        });
}