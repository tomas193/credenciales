let faltasChart;  // Declarar fuera de las funciones, en el ámbito global de tu script

$(document).ready(function() {
    stats();  // Llamar a stats al cargar la página

    // Escuchar cambios en los selectores
    $('#opciones_grupos, #opciones_turnos').on('change', function() {
        stats();  // Volver a llamar a stats cuando cambie el selector
    });
});

function stats() {
    const grupo = document.getElementById('opciones_grupos').value;
    const turno = document.getElementById('opciones_turnos').value;
    let labels = [];
    let data = [];
    let matriculas=[];

    // Llamada a la API
    axios.get('/api/test')
        .then(response => {
            const datos = response.data;
            datos.forEach(alumnos => {
                if (alumnos['grupo'] == grupo && alumnos['turno'] == turno) {
                    labels.push(alumnos['nombre']);
                    data.push(alumnos['faltas']);
                    matriculas.push(alumnos['matricula']);
                }
            });

            faltas_por_mes(matriculas);

            const maximo_faltas=Math.max(...data);
            let alumno_mas_faltas=data.indexOf(maximo_faltas);

            nombre_alumno_mas_faltas=document.getElementById('nombre_alumno_mas_faltas');
            matricula_mas_faltas=document.getElementById('matricula_mas_faltas');
            faltas_de_alumno=document.getElementById('faltas_de_alumno');

            nombre_alumno_mas_faltas.textContent=labels[alumno_mas_faltas];
            matricula_mas_faltas.textContent=matriculas[alumno_mas_faltas];
            faltas_de_alumno.textContent='Total de Faltas: '+data[alumno_mas_faltas];

            var foto=document.getElementById('img_alumno');
            foto.src=`${matriculas[alumno_mas_faltas]}.png`

            // Destruir gráfica previa si existe
            if (faltasChart) {
                faltasChart.destroy();
            }

            // Crear la nueva gráfica
            var ctx = document.getElementById('faltas_grupo').getContext('2d');
            faltasChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Total de Faltas por Alumno',
                        data: data,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.error('There was an error!', error);
        });
}

function faltas_por_mes(matriculas_alumnos){
    axios.get('/api/meses').then(response =>{
        let meses=response.data;
        let matriculas_meses=[];
        meses.forEach(element => {
            matriculas_meses.push(element['matricula']);
        });
        let meses_reales=[];
        let indice;
        matriculas_alumnos.forEach(matricula => {
            indice=matriculas_meses.indexOf(matricula);
        });
    })
    .catch(error =>{
        console.error('There was an error!', error);
    });
}
