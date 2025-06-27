$(document).ready(function() {
    count(); 

    function count() {
    
        axios.get('/api/personal')
            .then(response => {
                const datos = response.data;
                //filtro = datos.filter(alumno => alumno.grupo == grupo && alumno.turno == turno);
                size = datos.length;
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
                                    <br>
                                </div>
                            `;
                            // Insertar el bloque en el contenedor
                            contenedor.innerHTML += bloqueHTML;
                        }
                    }
                }

                assign_info(datos);
                //update_assistance(filtro);

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

    function assign_info(personal){
        for(let i=0;i<personal.length;++i){
            let foto = document.getElementById('img_alumno_'+i);
            let nombre = document.getElementById('nombre_'+i);
            let matricula = document.getElementById('matricula_'+i);
            
            nombre.textContent=personal[i].nombre;
            matricula.textContent=personal[i].matricula;
            //foto.src=`${alumnos[i]['matricula']}.png`;
            asignarImagen(personal[i].matricula, foto);
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
