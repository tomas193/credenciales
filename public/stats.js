$(document).ready(function(){
    alumnos_mas_faltas();
    faltas_turnos();
    mat_graph();
    ves_graph();
});

function alumnos_mas_faltas(){
    return axios.get('/api/alumnos_mas_faltas')
    .then(response => {
        alumnos=response.data;

        var nombre_matutino=document.getElementById('nombre_matutino');
        var nombre_vespertino=document.getElementById('nombre_vespertino');
        var matricula_matutino=document.getElementById('matricula_matutino');
        var matricula_vespertino=document.getElementById('matricula_vespertino');
        var faltas_matutino=document.getElementById('faltas_matutino');
        var grupo_matutino=document.getElementById('grupo_matutino');
        var faltas_vespertino=document.getElementById('faltas_vespertino');
        var grupo_vespertino=document.getElementById('grupo_vespertino');
        var foto1=document.getElementById('img_alumno_mat');
        var foto2=document.getElementById('img_alumno_ves');
        var alumno1;var alumno2;

        alumnos.forEach(element => {
            if(element['turno']=="MATUTINO"){
                alumno1=element;
            }
            if(element['turno']=='VESPERTINO'){
                alumno2=element;
            }
        });

        foto1.src=`${alumno1['matricula']}.png`
        foto2.src=`${alumno2['matricula']}.png`
        matricula_matutino.textContent='Matricula: '+alumno1['matricula']
        matricula_vespertino.textContent='Matricula: '+alumno2['matricula']
        nombre_matutino.textContent=alumno1['nombre'];
        nombre_vespertino.textContent=alumno2['nombre'];
        faltas_matutino.textContent='Faltas: '+alumno1['faltas'];
        faltas_vespertino.textContent='Faltas: '+alumno2['faltas'];
        grupo_matutino.textContent='Grupo: '+alumno1['grupo'];
        grupo_vespertino.textContent='Grupo: '+alumno2['grupo'];
    })
    .catch(error => {
      console.error('There was an error!', error);
      throw error;
  });
}

function faltas_turnos(){
    return axios.get('api/faltas_turnos')
    .then(response => {
        turnos_data=response.data;
        var labels=[turnos_data[0]['turno'],turnos_data[1]['turno']];
        var data=[turnos_data[0]['total_faltas'],turnos_data[1]['total_faltas']]

        var ctx = document.getElementById('faltasChart').getContext('2d');
        var faltasChart = new Chart(ctx, {
            type: 'bar', // Tipo de gráfica (puedes cambiarlo a 'line', 'pie', etc.)
            data: {
                labels: labels, // Etiquetas en el eje X (turnos)
                datasets: [{
                    label: 'Total de Faltas',
                    data: data, // Datos (total de faltas)
                    backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)'],
                    borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true // Asegura que el eje Y comience en 0
                    }
                }
            }
        });

    })
    .catch(error => {
      console.error('There was an error!', error);
      throw error;
  });   
}

function mat_graph(){
    return axios.get('api/faltas_mat')
    .then(response => {
        faltas_mat=response.data;
        let labels=[];
        let data=[];
        faltas_mat.forEach(element => {
            labels.push(element['grupo']);
            data.push(element['total_faltas']);
        });

        var ctx = document.getElementById('faltas_mat').getContext('2d');
        var faltasChart = new Chart(ctx, {
            type: 'bar', // Tipo de gráfica (puedes cambiarlo a 'line', 'pie', etc.)
            data: {
                labels: labels, // Etiquetas en el eje X (turnos)
                datasets: [{
                    label: 'Total de Faltas',
                    data: data, // Datos (total de faltas)
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true // Asegura que el eje Y comience en 0
                    }
                }
            }
        });

    })
    .catch(error => {
      console.error('There was an error!', error);
      throw error;
  });  
}

function ves_graph(){
    return axios.get('api/faltas_ves')
    .then(response => {
        faltas_ves=response.data;

        let labels=[];
        let data=[];
        faltas_ves.forEach(element => {
            labels.push(element['grupo']);
            data.push(element['total_faltas']);
        });

        var ctx = document.getElementById('faltas_ves').getContext('2d');
        var faltasChart = new Chart(ctx, {
            type: 'bar', // Tipo de gráfica (puedes cambiarlo a 'line', 'pie', etc.)
            data: {
                labels: labels, // Etiquetas en el eje X (turnos)
                datasets: [{
                    label: 'Total de Faltas',
                    data: data, // Datos (total de faltas)
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true // Asegura que el eje Y comience en 0
                    }
                }
            }
        });

    })
    .catch(error => {
      console.error('There was an error!', error);
      throw error;
  });  
}