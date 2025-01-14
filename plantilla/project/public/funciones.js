$(document).ready(function(){
	var meses=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

	  var anterior = document.getElementById('mes_anterior');
    var actual = document.getElementById('mes_actual');
    var posterior = document.getElementById('mes_posterior');
    var nombre_alumno=document.getElementById('nombre_alumno');
    var grupo_alumno=document.getElementById('grupo_alumno');
    var turno_alumno=document.getElementById('turno_alumno');
    var matricula_alumno=document.getElementById('matricula_alumno');
    var contacto_alumno=document.getElementById('contacto_alumno');
    var correo_alumno=document.getElementById('correo_alumno');
    var tot_faltas=document.getElementById('tot_faltas');
    var dia_falta=document.getElementById('dia_falta');
    var per_asis=document.getElementById('per_asis');
    var mes_faltas=document.getElementById('mes_faltas');
    var faltas_trimestre=document.getElementById('faltas_trimestre');
    var indicador=document.getElementById('indicador');

    let celdas=['td1','td2','td3','td4','td5','td6','td7','td8','td9','td10','td11',
      'td12','td13','td14','td15','td16','td17','td18','td19','td20','td21','td22','td23','td24',
      'td25','td26','td27','td28','td29','td30','td31','td32','td33','td34','td35','td36',
      'td37','td38','td39'];

    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    var month=currentDate.getMonth();

    var control=month;
    var año=currentYear;

    anterior.textContent = meses[month-1];
    actual.textContent = meses[month]+' '+currentYear;
    posterior.textContent = meses[month+1];

    tot_faltas.textContent='-';
    dia_falta.textContent='-';
    per_asis.textContent='-';
    mes_faltas.textContent='-';
    faltas_trimestre.textContent='-';
    $('#contenido_indicador').hide();

  $('#busqueda').submit(function(e){
      e.preventDefault();
      var mt=document.getElementById('entrada').value.toUpperCase();
      //validar si es texto o numero

      var foto=document.getElementById('img_alumno');
      foto.src=`${mt}.png`
      getData(mt);
      asign_colors(month,currentYear,mt);
      stats(month,currentYear,mt,currentDate);
  });

  $('#mes_anterior').click(function(){
  	control-=1;
  	if(control==-1){control=11;año-=1;}
    var mt=document.getElementById('entrada').value;
  	control_meses(control);
    calendario(control,año);
    asign_colors(control,año,mt);
  });

  $('#mes_posterior').click(function(){
  	control+=1;
  	if(control==12){control=0;año+=1;}
    var mt=document.getElementById('entrada').value;
  	control_meses(control);
    calendario(control,año);
    asign_colors(control,año,mt);
  });

  calendario(month,currentYear);

function control_meses(control){
	if(control==0){
	  	anterior.textContent = meses[11];
	    actual.textContent = meses[control]+' '+año;
	    posterior.textContent = meses[control+1];
  	}else if(control==11){
	  	anterior.textContent = meses[control-1];
	    actual.textContent = meses[control]+' '+año;
	    posterior.textContent = meses[0];
  	}
  	else{
	  	anterior.textContent = meses[control-1];
	    actual.textContent = meses[control]+' '+año;
	    posterior.textContent = meses[control+1];
  	}
}

function asign_colors(month,año,mat){ //asignar colores a las casillas del calendario dependiendo si hubo falta
  var date= new Date(año,month+1,0).getDate();
  var date2= new Date(año,month,1).getDay();
  let dias=parseInt(date,10);

  return axios.get('/api/meses')
    .then(response => {
      const filasFiltradas = response.data.filter(item => item.matricula === mat);
      const primerFila = filasFiltradas[0];

      const inputs = [primerFila.jan, primerFila.feb, primerFila.mar, primerFila.apr, primerFila.may, primerFila.jun, primerFila.jul,primerFila.aug,
        primerFila.sep,primerFila.oct,primerFila.nov,primerFila.dec];

      let split_numbers=inputs[month].split(',');
    
      for(let i=0;i<dias;i++){
        var date3= new Date(año,month,i+1).getDay();
        if(date3!=0 && date3!=6){
        if(split_numbers[i]==0){
            document.getElementById(celdas[i+date2]).style.backgroundColor="red";
          }else if (split_numbers[i]==2){
            document.getElementById(celdas[i+date2]).style.backgroundColor="yellow";
          }else if(split_numbers[i]==3){
            document.getElementById(celdas[i+date2]).style.backgroundColor="orange";
          }else{
            document.getElementById(celdas[i+date2]).style.backgroundColor="green";
          }}
      }

    })
    .catch(error => {
      console.error('There was an error!', error);
      throw error;
  });
}

function getData(mt) {
  return axios.get('/api/alumnos')
    .then(response => {

      const filasFiltradas = response.data.filter(item => item.matricula === mt);
      const primerFila = filasFiltradas[0];

      const inputs = [primerFila.matricula, primerFila.nombre, primerFila.grupo, primerFila.turno, primerFila.telefono, primerFila.correo, primerFila.flag];
      const places=[matricula_alumno,nombre_alumno,grupo_alumno,turno_alumno,contacto_alumno,correo_alumno];
      const labels=['Matricula:','','Grupo:','Turno:','Telefono:','Correo:'];

      $('#contenido_indicador').show();

      if(inputs[6]==0){
        indicador.textContent='El alumno se encuentra fuera del plantel';
      }else{
        indicador.textContent='El alumno se encuentra dentro del plantel';
      }

      for (let i=0;i<((inputs.length)-1);i++){
        places[i].textContent=labels[i]+' '+inputs[i];//datos del alumno
      }
      return;
    })
    .catch(error => {
      console.error('There was an error!', error);
      throw error;
    });
  }

function calendario(month,año){ //generar calendario 
  var date= new Date(año,month+1,0).getDate();
  var date2= new Date(año,month,1).getDay();
  let dias=parseInt(date,10);

    for(let i=0;i<celdas.length;i++){
      document.getElementById(celdas[i]).textContent='';
      document.getElementById(celdas[i]).style.backgroundColor="white";
    }

    for(let i=0;i<dias;i++){document.getElementById(celdas[i+date2]).textContent=(i+1);}
}

function stats(month,año,mat,currentDate){ //asignar colores a las casillas del calendario dependiendo si hubo falta
  var dia = currentDate.getDate(); //regresa dia del mes


  let total_faltas=0; //total de faltas a clase
  let total_dias=0; //dias en que se tiene que asistir a la escuela entre lunes y viernes
  let dias_faltas=[0,0,0,0,0]; //sacar maximo y sale dias con mas faltas entre lunes y viernes
  let meses_faltas=[0,0,0,0,0,0,0,0,0,0,0,0]; //sacar maximo y sale mes con mas faltas 

  if ((month==6 && (16<=dia && dia<=31))|| (month==7 && (1<=dia && dia<26))){//intervalo de vacaciones
    tot_faltas.textContent='-';
    dia_falta.textContent='-';
    per_asis.textContent='-';
    mes_faltas.textContent='-';
    faltas_trimestre.textContent='-';
  }else{
    return axios.get('/api/meses')
    .then(response => {
      const filasFiltradas = response.data.filter(item => item.matricula === mat);
      const primerFila = filasFiltradas[0];

      const inputs = [primerFila.jan, primerFila.feb, primerFila.mar, primerFila.apr, primerFila.may, primerFila.jun, primerFila.jul,
        primerFila.aug,primerFila.sep,primerFila.oct,primerFila.nov,primerFila.dec  ];

      let mes_inicio=7; //variable que se incrementa desde el mes de agosto hasta el mes actual
      let flag=false; 

      while(flag==false){
        if(mes_inicio>11){mes_inicio=0;}
        let split_numbers=inputs[mes_inicio].split(',');
        let end_variable;
        
        if(mes_inicio==month){
          end_variable=dia;
          flag=true;}
        else{
          end_variable=split_numbers.length;
          }

          for(let i=0;i<end_variable;i++){
            var dia_semana=new Date(año,mes_inicio,(i+1)).getDay();
            if((dia_semana>0) && (dia_semana<6)){
              if(parseInt(split_numbers[i])==0){//puede ser cero o 2, que el retardo cuente como falta
                dias_faltas[dia_semana-1]+=1;
                meses_faltas[mes_inicio]+=1;
                total_faltas+=1;
              }
              if(parseInt(split_numbers[i])!=2){
                total_dias+=1;
              }
            }
          }
          mes_inicio+=1;
      }
      let porcentaje_asistencia=100-((total_faltas/total_dias)*100);
      var dia_mas_falta=0;
      var mes_mas_falta=0;
      let dias_de_la_semana=['lunes','martes','miercoles','jueves','viernes'];

      //sacar maximo mes correspondiente
      for(let i=0;i<meses_faltas.length;i++){
        if (meses_faltas[i]>meses_faltas[mes_mas_falta]){
          mes_mas_falta=i;}
      }

      //sacar maximo dias faltas
      for(let i=0;i<dias_faltas.length;i++){
        if(dias_faltas[i]>dias_faltas[dia_mas_falta]){
          dia_mas_falta=i;}
      }

      if(total_faltas!=0){
        mes_faltas.textContent=meses[mes_mas_falta];
        dia_falta.textContent=dias_de_la_semana[dia_mas_falta];
      }
      tot_faltas.textContent=total_faltas;
      if(total_dias>0){per_asis.textContent=(parseInt(porcentaje_asistencia)+'%');}
      faltas_trimestre.textContent=total_dias;

    })
    .catch(error => {
      console.error('There was an error!', error);
      throw error;
  });

  }
}
});

