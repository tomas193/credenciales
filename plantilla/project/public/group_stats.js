$(document).ready(function() {
    count(); 

    // Escuchar cambios en los selectores
    $('#opciones_grupos, #opciones_turnos').on('change', function() {
        count();
    });

    document.addEventListener('click', function(event) {
        if (event.target.id.startsWith('status_')) {
            count();
        }
    });

    function count() {
        const grupo = document.getElementById('opciones_grupos').value;
        const turno = document.getElementById('opciones_turnos').value;
        let filtro; let size;
    
        axios.get('/api/test')
            .then(response => {
                const datos = response.data;
                filtro = datos.filter(alumno => alumno.grupo == grupo && alumno.turno == turno);
                size = filtro.length;
                let blocks = Math.ceil(size/6);
                const totalBloques = 6;

                for (let k=0;k<9;++k){
                    const contenedor = document.getElementById(`row${k+1}`);
                    contenedor.innerHTML = '';
                    if(k<blocks){
                        for (let i = 0; i < totalBloques; i++) {
                            let idx=i+(6*k);
                            const bloqueHTML = `
                                <div class="block">
                                    <br>
                                    <img src="1.jpg" class="img_alumno" id="img_alumno_${idx}">
                                    <h3 id="nombre_${idx}"></h3>
                                    <h4 id="matricula_${idx}"></h4>
                                    <div class="row" id="dots_container">
                                        <div class="block1"><img src="green_dot.png" class="dot" id="green_dot_${idx}"></div>
                                        <div class="block1"><button id="status_${idx}"></button></div>
                                        <div class="block1"><img src="red_dot.png" class="dot" id="red_dot_${idx}"></div>
                                    </div>
                                    <br>
                                </div>
                            `;
                            // Insertar el bloque en el contenedor
                            contenedor.innerHTML += bloqueHTML;
                        }
                    }
                }

                assign_info(filtro);
                update_assistance(filtro);

            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    }

    function update_assistance(alumnos){
        for (let i=0;i<alumnos.length;++i){
            $('#'+'status_'+i).click(function(){
                update_db(alumnos[i]);
            });
        }
    }
    
    function update_db(alumno){
        let flag;
        if (alumno['flag']==0){
            flag=1;
            update_dia(alumno);
        }
        else{flag=0;}
    
        $.post('/update_assistance', {flag:flag,matricula:alumno['matricula']}, function() {});

    }

    function update_dia(alumno){
        const fecha = new Date();
        const mesNumero = fecha.getMonth();
        const diaNumero = fecha.getDate()-1;
    
        return axios.get('/api/meses')
          .then(response => {
            const filasFiltradas = response.data.filter(item => item.matricula === alumno['matricula']);
            const primerFila = filasFiltradas[0];
            const inputs = [primerFila.jan, primerFila.feb, primerFila.mar, primerFila.apr, primerFila.may, primerFila.jun, primerFila.jul,primerFila.aug,
                primerFila.sep,primerFila.oct,primerFila.nov,primerFila.dec];
            let split_numbers=inputs[mesNumero].split(',');
            split_numbers[diaNumero]=1;
            let dias_string=split_numbers.join();

            $.post('/update_dia', {mes: mesNumero, string:dias_string, matricula:alumno['matricula']}, function() {});
          
          })
          .catch(error => {
            console.error('error cabron', error);
            throw error;
        });
    }

    function assign_info(alumnos){
        for(let i=0;i<alumnos.length;++i){
            let foto = document.getElementById('img_alumno_'+i);
            let nombre = document.getElementById('nombre_'+i);
            let matricula = document.getElementById('matricula_'+i);
            let boton = document.getElementById('status_'+i);
            let green_dot = document.getElementById('green_dot_'+i);
            let red_dot = document.getElementById('red_dot_'+i);
    
            if(alumnos[i]['flag']==0){boton.textContent='entrar';
                red_dot.style.display = 'block';
                green_dot.style.display = 'none';
            }
            else{boton.textContent='salir';
                green_dot.style.display = 'block';
                red_dot.style.display = 'none';
            }
            
            nombre.textContent=alumnos[i]['nombre'];
            matricula.textContent=alumnos[i]['matricula'];
            //foto.src=`${alumnos[i]['matricula']}.png`;
            asignarImagen(alumnos[i]['matricula'], foto);
        }
    }

});

function asignarImagen(matricula, foto){
  const imagenUrl = `${matricula}.png`;

  fetch(imagenUrl, { method: 'HEAD' })
    .then(response => {
      if (response.ok) {
        foto.src = imagenUrl;
      } else {
        foto.src = '1.jpg';
        console.log("La imagen no existe.");
      }
    })
    .catch(error => {
      console.log("Error al verificar la imagen:", error);
    });
}
