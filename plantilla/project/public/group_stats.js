$(document).ready(function() {
    count();  // Llamar a stats al cargar la página

    // Escuchar cambios en los selectores
    $('#opciones_grupos, #opciones_turnos').on('change', function() {
        count();
        location.reload();
    });

    function count() {
        const grupo = document.getElementById('opciones_grupos').value;
        const turno = document.getElementById('opciones_turnos').value;
        let filtro; let size;
    
        axios.get('/api/test')
            .then(response => {
                const datos = response.data;
                filtro = datos.filter(alumno => alumno.grupo == grupo && alumno.turno == turno);
                size=filtro.length;
                let blocks=Math.ceil(size/6);
    
                const totalBloques = 6;
                for (let k=0;k<blocks;++k){
                    const contenedor = document.getElementById(`row${k+1}`);
                    for (let i = 0; i < totalBloques; i++) {
                        let idx=i+(6*k);
                        const bloqueHTML = `
                            <div class="block">
                                <br>
                                <img src="1.jpg" class="img_alumno" id="img_alumno_${idx}">
                                <h3 id="nombre_${idx}"></h3>
                                <h4 id="matricula_${idx}"></h4>
                                <button id="status_${idx}"></button>
                                <br>
                            </div>
                        `;
                        // Insertar el bloque en el contenedor
                        contenedor.innerHTML += bloqueHTML;
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
            $('#'+'img_alumno_'+i).click(function(){
                //let campo_texto = document.getElementById('entrada').value;
                //campo_texto.textContent='hola';
                window.location.href = '/';
            });
        }
    }
    
    function update_db(alumno){
        let flag;
        if (alumno['flag']==0){
            flag=1;
            update_dia(alumno);
        }
        else{
            flag=0;
            location.reload();
        }
    
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
            location.reload();
          
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
    
            if(alumnos[i]['flag']==0){boton.textContent='entrar';}
            else{boton.textContent='salir';}
            
            nombre.textContent=alumnos[i]['nombre'];
            matricula.textContent=alumnos[i]['matricula'];
            foto.src=`${matricula}.png`
            
        }
    }

});





