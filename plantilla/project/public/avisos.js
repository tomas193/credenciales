let avisos = [];

if (typeof gruposSeleccionados === 'undefined' || !Array.isArray(gruposSeleccionados)) {
    var gruposSeleccionados = [];
}

let seleccion = [];

// Función para cargar avisos desde localStorage
function cargarAvisosDesdeStorage() {
    try {
        const avisosGuardados = localStorage.getItem('avisos');
        if (avisosGuardados) {
            avisos = JSON.parse(avisosGuardados);
            console.log('Avisos cargados:', avisos.length);
        } else {
            avisos = [];
            console.log('No hay avisos guardados');
        }
    } catch (error) {
        console.error('Error al cargar avisos:', error);
        avisos = [];
    }
}

// Función para guardar avisos en localStorage
function guardarAvisosEnStorage() {
    try {
        localStorage.setItem('avisos', JSON.stringify(avisos));
        console.log('Avisos guardados:', avisos.length);
    } catch (error) {
        console.error('Error al guardar avisos:', error);
    }
}

// Cargar avisos al iniciar la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página cargada, cargando avisos...');
    cargarAvisosDesdeStorage();
    cargarAvisos();
});

document.getElementById('formularioAviso').addEventListener('submit', function(e) {
    e.preventDefault();

    const todoscheckbox = document.getElementById('todos_los_grupos');
    
    const titulo = document.getElementById('titulo_aviso').value;
    const tipo = document.getElementById('tipo_aviso').value;
    const contenido = document.getElementById('contenido_aviso').value;

    
    // Obtener grupos seleccionados
    const gruposSeleccionados = [];
    const checkboxes = document.querySelectorAll('input[name="grupos"]:checked');
    checkboxes.forEach(checkbox => {
        gruposSeleccionados.push(checkbox.value);
    });
    
    if (seleccion.length === 0 && todoscheckbox.checked === false) {
        alert('⚠️ Por favor seleccione al menos un grupo destinatario');
        return;
    }

    // Crear nuevo aviso
    const nuevoAviso = {
        id: Date.now(),
        titulo: titulo,
        tipo: tipo,
        contenido: contenido,
        destinatarios: seleccion,
        fecha: new Date().toLocaleString('es-ES')
    };

    alert(`Nuevo Aviso Creado:
    ID: ${nuevoAviso.id}
    Título: ${nuevoAviso.titulo}
    Tipo: ${nuevoAviso.tipo}
    Contenido: ${nuevoAviso.contenido}
    Destinatarios: ${nuevoAviso.destinatarios}
    Fecha: ${nuevoAviso.fecha}`);

    // Agregar al array
    avisos.unshift(nuevoAviso); // unshift para que aparezca al principio
    
    // Guardar en localStorage
    guardarAvisosEnStorage();
    
    // Recargar la lista
    cargarAvisos();
    
    // Cerrar formulario y limpiar
    cerrarFormulario();
    
    alert('✅ Aviso publicado exitosamente');


});

// Función para mostrar/ocultar el selector custom
function toggleSelectorCustom() {
    const todoscheckbox = document.getElementById('todos_los_grupos');
    const selectorCustom = document.getElementById('selectorCustom');
    if (todoscheckbox.checked) {
        selectorCustom.style.display = 'none';
        // Limpiar selección custom si se marca "todos"
        limpiarGrupos();
    } else {
        selectorCustom.style.display = 'block';
    }
    // Actualizar campo hidden
    actualizarCampoHidden();
}

// Función para agregar un grupo a la lista
function agregarGrupo() {
    const selector = document.getElementById('selector_grupos');
    const grupoSeleccionado = selector.value;
    if (grupoSeleccionado && gruposSeleccionados.indexOf(grupoSeleccionado) === -1) {
        seleccion.push(grupoSeleccionado);
        gruposSeleccionados.push(grupoSeleccionado);
        actualizarVistaGrupos();
        selector.value = ''; // Resetear el selector
        // Actualizar campo hidden
        actualizarCampoHidden();
    }
}

// Función para actualizar la vista de grupos seleccionados
function actualizarVistaGrupos() {
    const container = document.getElementById('gruposSeleccionados');
    if (gruposSeleccionados.length === 0) {
        container.innerHTML = '<p>No hay grupos seleccionados</p>';
    } else {
        let html = '<strong>Grupos seleccionados:</strong><br>';
        gruposSeleccionados.forEach(grupo => {
            html += `<span class="grupo-tag">${grupo}<span class="remove-btn" onclick="removerGrupo('${grupo}')">×</span></span>`;
        });
        container.innerHTML = html;
    }
}

// Nueva función para actualizar el campo hidden
function actualizarCampoHidden() {
    let hiddenField = document.getElementById('grupos_hidden');
    if (!hiddenField) {
        // Crear el campo hidden si no existe
        hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.id = 'grupos_hidden';
        hiddenField.name = 'grupos';
        document.getElementById('formularioAviso').appendChild(hiddenField);
    }
    
    const todosCheckbox = document.getElementById('todos_los_grupos');
    if (todosCheckbox.checked) {
        hiddenField.value = 'todos';
    } else {
        hiddenField.value = gruposSeleccionados.join(',');
    }
}

// Función para obtener los destinatarios seleccionados
function obtenerDestinatarios() {
    const todosCheckbox = document.getElementById('todos_los_grupos');
    if (todosCheckbox.checked) {
        return 'todos';
    } else {
        return gruposSeleccionados;
    }
}

// Función para limpiar todos los grupos seleccionados
function limpiarGrupos() {
    gruposSeleccionados = [];
    actualizarVistaGrupos();
    // Actualizar campo hidden
    actualizarCampoHidden();
}

// Función para remover un grupo de la lista
function removerGrupo(grupo) {
    gruposSeleccionados = gruposSeleccionados.filter(g => g !== grupo);
    actualizarVistaGrupos();
    // Actualizar campo hidden
    actualizarCampoHidden();
}

// Inicializar el campo hidden cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    actualizarCampoHidden();
});

// Función para mostrar/ocultar el formulario
function toggleFormulario() {
    const formularioContainer = document.getElementById('formularioContainer');
    const btnMostrar = document.getElementById('btnMostrarFormulario');
    
    if (formularioContainer.style.display === 'none') {
        formularioContainer.style.display = 'block';
        btnMostrar.style.display = 'none';
        // Scroll al formulario
        formularioContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

// Función para cerrar el formulario
function cerrarFormulario() {
    const formularioContainer = document.getElementById('formularioContainer');
    const btnMostrar = document.getElementById('btnMostrarFormulario');
    
    formularioContainer.style.display = 'none';
    btnMostrar.style.display = 'inline-flex';
    limpiarFormulario();
}

function cargarAvisos() {
    const listaContainer = document.getElementById('listaAvisos');
    
    if (avisos.length === 0) {
        listaContainer.innerHTML = '<div class="no-avisos"><p>No hay avisos publicados aún. ¡Crea el primero!</p></div>';
        return;
    }
    
    let html = '';
    avisos.forEach(aviso => {
        html += `
            <div class="aviso-card">
                <div class="aviso-header">
                    <h4 class="aviso-titulo">${aviso.titulo}</h4>
                    <div class="aviso-meta">
                        <div class="aviso-fecha">${aviso.fecha}</div>
                        <span class="aviso-tipo ${aviso.tipo}">${aviso.tipo.toUpperCase()}</span>
                    </div>
                </div>
                <div class="aviso-destinatarios">
                    ${aviso.destinatarios}
                </div>
                <div class="aviso-contenido">
                    ${aviso.contenido.replace(/\n/g, '<br>')}
                </div>
                <div class="aviso-acciones">
                    <button class="btn-edit" onclick="editarAviso(${aviso.id})">✏️ Editar</button>
                    <button class="btn-delete" onclick="eliminarAviso(${aviso.id})">🗑️ Eliminar</button>
                </div>
            </div>
        `;
    });
    
    listaContainer.innerHTML = html;
}

function limpiarFormulario() {
    document.getElementById('formularioAviso').reset();
}

function eliminarAviso(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este aviso?')) {
        avisos = avisos.filter(aviso => aviso.id !== id);
        guardarAvisosEnStorage();
        cargarAvisos();
        alert('🗑️ Aviso eliminado correctamente');
    }
}

function editarAviso(id) {
    const aviso = avisos.find(a => a.id === id);
    if (aviso) {
        // Mostrar formulario
        toggleFormulario();
        
        // Cargar datos del aviso
        document.getElementById('titulo_aviso').value = aviso.titulo;
        document.getElementById('tipo_aviso').value = aviso.tipo;
        document.getElementById('contenido_aviso').value = aviso.contenido;
        
        // Eliminar el aviso anterior
        avisos = avisos.filter(a => a.id !== id);
        guardarAvisosEnStorage();
        cargarAvisos();
    }
}