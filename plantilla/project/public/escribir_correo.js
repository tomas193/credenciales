const formulario = document.getElementById('formularioContainer');
const overlay = document.getElementById('overlay');
var campoCorreo = correo_alumno;
var correo_destino = document.getElementById('correo_destino');
var asunto_correo = document.getElementById('asunto_correo');
var mensaje_correo = document.getElementById('mensaje_correo');
var formulario_correo = document.getElementById('formularioCorreo');
let correo, asunto, mensaje;

$(document).ready(function() {
    $(mail).click(function(){
        correo = campoCorreo.textContent.split(': ');
        correo = correo[1];
        open_mail_form();
    });
});

function open_mail_form(){
    correo_destino.value = correo;
    asunto_correo.value = '';
    mensaje_correo.value = '';
    formulario.style.display = 'block';
    overlay.style.display = 'block';
}

formulario_correo.addEventListener('submit', send_mail);

function send_mail(event){
    event.preventDefault();

    asunto = asunto_correo.value;
    mensaje = mensaje_correo.value;
    let datos_correo = [correo_destino.value, asunto, mensaje];

    ejecutarPython(datos_correo);
    alert("correo enviado");
    cerrarFormulario();
}

async function ejecutarPython(datos_correo) {

    const argumentos = {
      correo: datos_correo[0],
      asunto: datos_correo[1],
      mensaje: datos_correo[2]
    };

    const respuesta = await fetch('/mailScript', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(argumentos)
    });

    const data = await respuesta.json();
    document.getElementById('salida').textContent = data.resultado || data.error;
}

function cerrarFormulario() {
    formulario.style.display = 'none';
    overlay.style.display = 'none';
}