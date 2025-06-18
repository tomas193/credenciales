let nombre;

$(document).ready(function() {
    var download_button = document.getElementById('download_button');
    $(download_button).hide();

    $(download_button).click(function(){
        nombre = datos_alumno[1];
        descargarImagen(`/id_matricula/${mt}.png`, `${nombre}.png`);
    });
})

function descargarImagen(url, nombreArchivo){
    const enlace = document.createElement('a');    
    enlace.href = url;                     
    enlace.download = nombreArchivo || 'imagen.png';   
    document.body.appendChild(enlace);              
    enlace.click();                                 
    document.body.removeChild(enlace); 
}
