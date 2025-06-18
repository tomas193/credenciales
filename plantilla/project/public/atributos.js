let escuela = 33;

$(document).ready(function(){

	var clave = document.getElementById('clave');
    var nombre_escuela = document.getElementById('nombre_escuela');
    clave.textContent='Clave: XXXXXXXXXX';
    nombre_escuela.textContent='Escuela Secundaria Técnica '+escuela;

    navigate();
});

function navigate(){
    $('#general_stats').click(function(){
        window.location.href = 'stats';
    });
    
    $('#modificacion_asistencia').click(function(){
    window.location.href = 'asistencia';
    });
}


