$(document).ready(function() {
    $('#selector_pagina').on('change', function() {
        cambio_pagina();
    });
})

function cambio_pagina(){
    const pagina = document.getElementById('selector_pagina').value;
    window.location.href = pagina;

}