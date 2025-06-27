var label_editar_grupo = document.getElementById('label_editar_grupo');
var label_editar_turno = document.getElementById('label_editar_turno');
var label_editar_telefono = document.getElementById('label_editar_telefono');
var selector_editar_grupo = document.getElementById('editar_grupo');
var selector_editar_turno = document.getElementById('editar_turno');
var label_editar_correo = document.getElementById('label_editar_correo');
var input_telefono = document.getElementById('editar_telefono');
var label_telefono = document.getElementById('contacto_alumno');
var boton_guardar = document.getElementById('boton_guardar');
var input_correo = document.getElementById('editar_correo');
var label_correo = document.getElementById('correo_alumno');
var label_grupo = document.getElementById('grupo_alumno');
var label_turno = document.getElementById('turno_alumno');
var delete_user = document.getElementById('delete_user');
var mail = document.getElementById('write_mail');
var back = document.getElementById('back');

$(document).ready(function() {

    default_settings_inputs();

    $(label_editar).click(function(){
        settingsEditClick();
        place_data();
    });

    $(boton_guardar).click(function(){
        guardar_cambios();
        default_settings_inputs();
        generar_credencial();
        alert('Cambios guardados correctamente.')
        $(label_editar).show();
        location.reload();
    });

    $(delete_user).click(function(){
        eliminar_alumno();
        alert('Alumno eliminado correctamente.');
        location.reload();
    });

    $(back).click(function(){
        default_settings_inputs();
        $(label_editar).show();
        $(mail).show();
    });

});

function generar_credencial(){
    let comando = `SELECT * from alumnos where matricula = ${mt}`;

    $.post('/probar_url', {
        query: comando
    }, function() {});

    editar_credencial();
}

async function editar_credencial(){

    const respuesta = await fetch('/generarCredencial', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await respuesta.json();
    document.getElementById('salida').textContent = data.resultado || data.error;

}

function eliminar_alumno(){
    $.post('/eliminar_alumno', {
        matricula:mt
    }, function() {});
}

function guardar_cambios(){
    $.post('/actualizar_datos_alumno', {
        grupo:selector_editar_grupo.value,
        turno: selector_editar_turno.value,
        telefono: input_telefono.value,
        correo: input_correo.value,
        matricula:mt
    }, function() {});
}

async function place_data(){
    const [matricula, nombre, grupo, turno, celular, correo, flag_asistencia] = await getData(mt);
    input_correo.value = correo;
    input_telefono.value = celular;
    selector_editar_grupo.value = grupo;
    selector_editar_turno.value = turno;
}

function default_settings_inputs(){
    $(selector_editar_grupo).hide();
    $(selector_editar_turno).hide();
    $(label_editar_grupo).hide();
    $(label_editar_turno).hide();
    $(label_editar_telefono).hide();
    $(label_editar_correo).hide();
    $(input_telefono).hide();
    $(label_telefono).show();
    $(boton_guardar).hide();
    $(label_editar).hide();
    $(input_correo).hide();
    $(label_correo).show();
    $(label_grupo).show();
    $(label_turno).show();
    $(delete_user).hide();
    $(mail).hide();
    $(back).hide();
    for(let i=0; i<=9; ++i){
        $('#break'+i).hide();
    }
}

function settingsEditClick(){
    $(selector_editar_grupo).show();
    $(selector_editar_turno).show();
    $(label_editar_telefono).show();
    $(label_editar_correo).show();
    $(label_editar_grupo).show();
    $(label_editar_turno).show();
    $(input_telefono).show();
    $(label_telefono).hide();
    $(boton_guardar).show();
    $(label_correo).hide();
    $(label_editar).hide();
    $(input_correo).show();
    $(label_grupo).hide();
    $(label_turno).hide();
    $(delete_user).show();
    $(mail).hide();
    $(back).show();
    for(let i=0; i<=9; ++i){
        $('#break'+i).show();
    }
}


