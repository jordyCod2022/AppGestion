let lineChartContainer;
let barBarrasContainer;
let globalidAsignacion;
let nuevoAdmin;
let telefonoUsuario;
let telefonoAdmins;
let nombreTrasfer;
let nombreSesionActual;
let fechaGlobal;
document.addEventListener('DOMContentLoaded', async () => {
  // Recupera los datos almacenados en localStorage
  const storedNombreData = localStorage.getItem('nombreData');
  const nombreData = storedNombreData ? JSON.parse(storedNombreData) : null;
  const items = document.querySelectorAll("#IconosAside li");
  var iconoHome = document.querySelector('#IconosAside li:first-child');
  iconoHome.classList.add('seleccionado');
  //Varible que tiene el id del admin 
  // Llamas a la función para obtener el historial
  const historialSemana = getHistorialSemana();
  nombreSesionActual = `${nombreData.nombre}`;
  apellidoSesionActual = `${nombreData.apellido}`;
  const nombreCompleto = `${nombreSesionActual} ${apellidoSesionActual}`;
 

  // Muestras el historial en la consola
  console.log('Historial de la semana:', historialSemana);




  obtenerAdmin(nombreData.id_colaborador);
  const barChartContainer = document.getElementById('barChartContainer');
  const barLineContainer = document.getElementById('barLineContainer');
  const enviarButton = document.querySelector('.enviarButton button');
  const enviarNombre = document.querySelector('.nombreUsuarioActual');
  const enviarFecha=document.querySelector('.fechaActual');
  


  enviarNombre.textContent = nombreCompleto;
  

  if (barChartContainer && barLineContainer) {
    barBarrasContainer = barChartContainer;
    lineChartContainer = barLineContainer;
  } else {
    console.error('Elemento con ID "barChartContainer" no encontrado en el DOM.');
    console.error('Elemento con ID "barLineContainer" no encontrado en el DOM.');
    return;
  }


  items.forEach((item) => {
    const tooltipText = item.querySelector("a").getAttribute("data-tooltip");
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.innerText = tooltipText;
    item.appendChild(tooltip);
  });



  const avatarUrl = await obtenerAvatar(nombreData.id_colaborador);
  localStorage.setItem('avatarUrl', avatarUrl);
  if (avatarUrl) {
    // Obtener el elemento de la imagen por su ID
    const imagenColaboradorElement = document.getElementById('imagenColaborador');

    // Establecer la URL de la imagen como el src
    imagenColaboradorElement.src = avatarUrl;
    imagenColaboradorElement.alt = 'Avatar';
  } else {
    console.error('No se encontró la imagen del avatar');
  }
  console.log(nombreData)

  //Llamada de funciones principales
  const currentDate = getCurrentDate();

  fechaGlobal=currentDate

  updateGrafica(currentDate);
  updateGraficaLineal(currentDate);
  updateTotalesIncidencias(currentDate);
  updateUltimosIncidentes(currentDate);
  actualizarFechaSpan(currentDate)

  const incidencias = await getAndShowIncidencias(nombreData.id_colaborador, currentDate);


  const dataTable = $('#miTabla').DataTable({
    data: incidencias,
    columns: [
      { data: 'id_incidente', title: 'Id' },
      { data: 'incidente_descrip', title: 'Incidente' },
      {
        data: null,
        title: 'Usuario',
        render: function (data, type, row) {
          return row.nombre_colaborador + ' ' + row.apellido_colaborador;
        }
      },
      {
        data: null,
        title: 'Acción',
        render: function (data, type, row) {
          return '<button class="button"><svg class="saveicon" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" stroke-linejoin="round" stroke-linecap="round"></path></svg> Enviar</button>';
        }
      }
    ],
    paging: true,
    pageLength: 2,
    lengthMenu: [2], // Limita las opciones de mostrar en el control de selección a 3

  });



  $('.modalTrasferencia').on('click', function (e) {
    if (e.target.id === 'iconosss') {
      // Si se hace clic en el ícono de cerrar, cierra el modal
      $('.modalTrasferencia').css('display', 'none');
    }
  });

  $('#miTabla').on('click', '.button', function () {
    // Obtén la fila correspondiente al botón clickeado
    const data = dataTable.row($(this).closest('tr')).data();
    nuevoAdmin = data.id_incidente
    telefonoUsuario=data.telefono_colaborador

    enviarButton.addEventListener('click', async () => {
      try {
        // Log de información
        console.log(nuevoAdmin);
        console.log(globalidAsignacion);
    
        // Actualizar asignación de usuario
        actualizarAsignacionUser(nuevoAdmin, globalidAsignacion);

      
        // Enviar mensaje al usuario afectado
        const mensajeTelegramUsuario = `¡Atención! 🚨 Tu incidente ha sido transferido a otro encargado. Ahora está siendo gestionado por ${nombreTransfer} 🕵️‍♂️. ¡Gracias por tu comprensión! 🙌`;
        await enviarMensajeTelegram(telefonoUsuario, mensajeTelegramUsuario);
    
        // Enviar mensaje a los administradores
        const mensajeAdmins = `${nombreSesionActual}, ¡te ha transferido un incidente! 🔄 Por favor, revísalo en: https://appgestion.onrender.com 🚀`;
        await enviarMensajeTelegram(telefonoAdmins, mensajeAdmins);
    
        // Log de éxito
        console.log('¡Operación completada con éxito!');
    
      } catch (error) {
        // Manejo de errores
        console.error('Error en la operación:', error);
        // Puedes mostrar un mensaje de error al usuario si es necesario
        alert('Se produjo un error al procesar la operación. Por favor, inténtalo de nuevo.');
      }
    });
    

    // Llena el modal con la información correspondiente y aplica estilos de factura
    $('.detallesTransfer').html(`
    <table class="detallesTable">
        <tr>
            <th>Título</th>
            <th>Descripción</th>
        </tr>
        <tr>
            <td class="labelTransfer"><span class="factura-label">Id</span></td>
            <td>${data.id_incidente}</td>
        </tr>
        <tr>
            <td class="labelTransfer"><span class="factura-label">Incidente</span></td>
            <td>${data.incidente_descrip}</td>
        </tr>
        <tr>
            <td class="labelTransfer"><span class="factura-label">Usuario</span></td>
            <td>${data.nombre_colaborador} ${data.apellido_colaborador}</td>
        </tr>
    </table>
`);


    // Muestra el modal y el overlay
    $('.modalTrasferencia').css('display', 'block');
  });

  // Agrega estilos CSS en línea para el tipo de letra y otros estilos de factura



  const logoutButton = document.querySelector('.salir');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      const confirmLogout = confirm('¿Estás seguro de cerrar sesión?');
      if (confirmLogout) {
        localStorage.removeItem('nombreData');
        window.location.href = '../../index.html'; // Redirige y reemplaza la entrada en el historial
        window.history.replaceState(null, '', '../../index.html');
      }
    });
  } else {
    console.error('No se encontró el botón de cerrar sesión');
  }

  



  const dateContainer = document.createElement('span');


  // Función para obtener la fecha actual
  function getCurrentDate() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Configurar la presentación de la fecha
  dateContainer.innerText = getCurrentDate();
  dateContainer.className = 'current-date';


  // Configurar flatpickr para el selector de fecha
  const flatpickrInstance = flatpickr('.connectBtn', {
    dateFormat: 'Y-m-d',
    onClose: function (selectedDates, dateStr) {
      dateContainer.innerText = dateStr;

      actualizarFechaSpan(dateStr)

      // Actualizar los totales de incidencias con la nueva fecha
      updateTotalesIncidencias(dateStr);
      updateGrafica(dateStr);
      getCurrentDate(dateStr);
      updateGraficaLineal(dateStr)
      localStorage.setItem('dashboardFecha', dateStr);
      getAndShowIncidencias(nombreData.id_colaborador, dateStr)
    },
  });

  function actualizarFechaSpan(currentDate){

    enviarFecha.textContent = currentDate;
  }



  async function updateTotalesIncidencias(newDate) {
    localStorage.setItem('dashboardFecha', newDate);
    // Obtener id_asignacion_user y otros datos del localStorage
    const storedNombreData = localStorage.getItem('nombreData');
    const nombreData = storedNombreData ? JSON.parse(storedNombreData) : null;

    // Verificar si hay datos y obtener id_asignacion_user
    if (nombreData && nombreData.username) {
      const idAsignacionUser = nombreData.id_colaborador;

      // Obtener totales de incidencias con la nueva fecha
      const totalesResponse = await fetch(`/getTotalesIncidencias?id_asignacion_user=${idAsignacionUser}&fecha_incidencia=${newDate}`);


      localStorage.setItem('idAsignacionUser', idAsignacionUser);
      const totalesData = await totalesResponse.json();
      console.log('Resultados de incidencias:', totalesData);

      // Actualizar elementos HTML con los resultados
      const ticketsPendientesElement = document.getElementById('ticketsPendientes');
      const ticketsResueltosElement = document.getElementById('ticketsResueltos');


      if (ticketsPendientesElement && ticketsResueltosElement) {
        ticketsPendientesElement.querySelector('.name').textContent = totalesData.total_pendientes || 'N/A';
        ticketsResueltosElement.querySelector('.name').textContent = totalesData.total_cerrados || 'N/A';

      } else {
        console.error('Elemento no encontrado');
      }

      if (ticketsPendientesElement) {
        ticketsPendientesElement.addEventListener('click', () => {
          window.location.href = '../pendIncidentes/pendIncidentes.html';
        });
      } else {
        console.error('Elemento "ticketsPendientes" no fue encontrado');
      }
    }
  }


  async function updateGrafica(newDate) {
    console.log('Entrando a updateGrafica');
    const storedNombreData = localStorage.getItem('nombreData');
    const nombreData = storedNombreData ? JSON.parse(storedNombreData) : null;
  
    if (nombreData && nombreData.username) {
      const idAsignacionUser = nombreData.id_colaborador;
  
      // Obtener datos de incidencias con la nueva fecha
      const totalesResponse = await fetch(`/getIncidenciasGrafico?id_asignacion_user=${idAsignacionUser}&fecha_incidencia=${newDate}`);
      localStorage.setItem('idAsignacionUser', idAsignacionUser);
      const totalesData = await totalesResponse.json();
      console.log('Resultados de las gráficas:', totalesData);
  
      // Destruir el gráfico existente si hay uno
      if (window.barChart) {
        window.barChart.destroy();
      }
  
      // Crear arrays para etiquetas (nombres) y datos (cantidades)
      const etiquetas = totalesData.map(item => item.nombre_reportador);
      const datos = totalesData.map(item => item.total_incidentes);
  
      // Crear el gráfico de barras vertical
      window.barChart = new Chart(barBarrasContainer, {
        type: 'bar',
        data: {
          labels: etiquetas,
          datasets: [{
            label: 'Incidentes Reportados Por Usuario',
            data: datos,
            backgroundColor: 'rgba(0, 123, 255, 0.5)',
            borderColor: 'rgba(0, 123, 255, 1)',
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y',
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                color: 'black',
                font: {
                  family: 'Outfit, sans-serif', 
                }
              }
            },
            y: {
              ticks: {
                color: 'black',
                font: {
                  family: 'Outfit, sans-serif',
                  size: 12
                }
              }
            }
          },
          plugins: {
            legend: {
              labels: {
                color: 'black',
                font: {
                  family: 'Outfit, sans-serif', 
                  size: 12
                }
              }
            }
          }
        }
      });
    }
  }
  
  


  async function obtenerAvatar(idAsignacionUser) {
    try {
      const avatarResponse = await fetch('/obtenerAvatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id_asignacion_user: idAsignacionUser })
      });

      const avatarData = await avatarResponse.json();
      return avatarData.imagen_colaborador;
    } catch (error) {
      console.error('Error al obtener el avatar:', error);
      return null;
    }
  }

  async function updateGraficaLineal(newDate) {
    console.log('Entrando a updateGraficaLINEAL');
  
    const storedNombreData = localStorage.getItem('nombreData');
    const nombreData = storedNombreData ? JSON.parse(storedNombreData) : null;
  
    if (nombreData && nombreData.username) {
      const idAsignacionUser = nombreData.id_colaborador;
  
      try {
        // Obtener datos de incidencias con la nueva fecha
        const totalesResponse = await fetch(`/getTotalIncidentesSemana?id_asignacion_user=${idAsignacionUser}&fecha_incidencia=${newDate}`);
        localStorage.setItem('idAsignacionUser', idAsignacionUser);
        const totalesData = await totalesResponse.json();
  
        // Verificar si totalesData es un array antes de intentar mapearlo
        if (Array.isArray(totalesData)) {
          console.log('Resultados de las gráficas:', totalesData);
  
          // Sumar los total_incidentes
          const sumaTotalIncidentes = totalesData.reduce((suma, item) => suma + parseInt(item.total_incidentes, 10), 0);
  
          console.log('Suma total de incidentes:', sumaTotalIncidentes);
          const totalSemanaElement = document.getElementById('totalSemana');
          if (totalSemanaElement) {
            totalSemanaElement.textContent = sumaTotalIncidentes.toString();
          } else {
            console.error('No se encontró el elemento con id "totalSemana"');
          }
  
          // Destruir el gráfico existente si hay uno
          if (window.lineChart) {
            window.lineChart.destroy();
          }
  
          // Crear arrays para etiquetas (días de la semana) y datos (cantidades)
          const etiquetas = totalesData.map(item => item.dia_semana);
          const datos = totalesData.map(item => item.total_incidentes);
  
          // Crear el gráfico de línea con interpolación cúbica
          window.lineChart = new Chart(lineChartContainer, {
            type: 'line',
            data: {
              labels: etiquetas,
              datasets: [{
                label: 'Total de Incidentes en la Semana',
                data: datos,
                fill: true,
                backgroundColor: 'rgba(0, 0, 255, 0.3)', // Blue background with 30% opacity
                borderColor: 'rgba(0, 0, 255, 1)',    // Solid blue border
                
                
                borderWidth: 2
              }]
            },
            options: {
              aspectRatio: 2,
              scales: {
                x: {
                  beginAtZero: true,
                  ticks: {
                    color: 'black',
                    font: {
                      family: 'Outfit, sans-serif', // Cambia 'Outfit' por la fuente que desees
                      size: 12
                    }
                  }
                },
                y: {
                  precision: 0,
                  ticks: {
                    color: 'black',
                    font: {
                      family: 'Outfit, sans-serif', // Cambia 'Outfit' por la fuente que desees
                      size: 12
                    }
                  }
                }
              },
              plugins: {
                legend: {
                  labels: {
                    color: 'black',
                    font: {
                      family: 'Outfit, sans-serif', // Cambia 'Outfit' por la fuente que desees
                      size: 12
                    }
                  }
                }
              },
              elements: {
                line: {
                  tension: 0.0
                }
              }
            }
          });
  
          const today = new Date();
          if (today.getDay() === 5) { // Viernes
            const historialSemana = JSON.parse(localStorage.getItem('historialSemana')) || [];
            historialSemana.push({
              fecha: today.toISOString(),
              etiquetas: etiquetas,
              datos: datos
            });
            localStorage.setItem('historialSemana', JSON.stringify(historialSemana));
          }
        } else {
          console.error('El servidor no devolvió un array válido:', totalesData);
        }
      } catch (error) {
        console.error('Error al obtener los datos del servidor:', error);
      }
    }
  }
  

  function getHistorialSemana() {
    return JSON.parse(localStorage.getItem('historialSemana')) || [];
  }

  async function updateUltimosIncidentes(newDate) {
    localStorage.setItem('dashboardFecha', newDate);
  
    // Obtener id_asignacion_user y otros datos del localStorage
    const storedNombreData = localStorage.getItem('nombreData');
    const nombreData = storedNombreData ? JSON.parse(storedNombreData) : null;
  
    // Verificar si hay datos y obtener id_asignacion_user
    if (nombreData && nombreData.username) {
      const idAsignacionUser = nombreData.id_colaborador;
  
      // Obtener los últimos incidentes con la nueva fecha
      const ultimosIncidentesResponse = await fetch(`/getUltimosIncidentes?id_asignacion_user=${idAsignacionUser}&fecha_incidencia=${newDate}`);
  
      localStorage.setItem('idAsignacionUser', idAsignacionUser);
      const ultimosIncidentesData = await ultimosIncidentesResponse.json();
      console.log('Resultados de los últimos incidentes:', ultimosIncidentesData);
  
      // Actualizar la tabla de actividades recientes
      const tablaUltimosReportes = document.getElementById('tablaUltimosReportes');
  
      if (tablaUltimosReportes) {
      
  
        if (ultimosIncidentesData.length > 0) {
          // Crear las nuevas filas con los datos de los últimos incidentes
          ultimosIncidentesData.forEach(incidente => {
            const fila = document.createElement('tr');
            const avatarCol = document.createElement('td');
            const nombreReportadorCol = document.createElement('td');
            const incidenteCol = document.createElement('td');
  
            const avatarImg = document.createElement('img');
            avatarImg.src = incidente.imagen_colaborador;
            avatarImg.alt = 'Avatar';
            avatarCol.appendChild(avatarImg);
  
            nombreReportadorCol.textContent = `${incidente.nombre_reportador}`;
            incidenteCol.textContent = `${incidente.incidente_descrip}`;
  
            fila.appendChild(avatarCol);
            fila.appendChild(nombreReportadorCol);
            fila.appendChild(incidenteCol);
  
            tablaUltimosReportes.appendChild(fila);
          });
        } else {
          // Agregar una fila indicando que no hay registros
          const filaNoRegistros = document.createElement('tr');
          const celdaMensaje = document.createElement('td');
          celdaMensaje.colSpan = 3; // O ajusta al número de columnas que tengas
  
          celdaMensaje.textContent = 'No hay registros disponibles';
          filaNoRegistros.appendChild(celdaMensaje);
  
          tablaUltimosReportes.appendChild(filaNoRegistros);
        }
      } else {
        console.error('Elemento "tablaUltimosReportes" no encontrado');
      }
    }
  }
  

  async function getAndShowIncidencias(idAsignacionUser, fechaDashboard) {
    try {
      const response = await fetch(`/getIncidencias?id_asignacion_user=${idAsignacionUser}&fecha_incidencia=${fechaDashboard}`);
      const incidencias = await response.json();
      console.log('Respuesta de incidencias:', incidencias);

      return incidencias; // Retorna las incidencias obtenidas
    } catch (error) {
      console.error('Error al obtener y mostrar incidencias:', error);
      return []; // Retorna un array vacío en caso de error
    }
  }

  let globalidAsignacion; // Asegúrate de declarar esta variable global

  async function obtenerAdmin(idAsignacionUser) {
    console.log("MI ID DESDE OBTENER ADMIN: ", idAsignacionUser);
  
    try {
      const respuestaAdmin = await fetch(`/getUsuariosExcluyendoId?id_asignacion_user=${idAsignacionUser}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id_asignacion_user: idAsignacionUser })
      });
  
      const dataAdmin = await respuestaAdmin.json();
      console.log("data: ", dataAdmin);
  
      const selectNombres = document.getElementById('listaNombres');
      // Limpia las opciones antes de agregar las nuevas
      selectNombres.innerHTML = '';
  
      // Agrega una opción en blanco por defecto
      const blankOption = document.createElement('option');
      blankOption.value = '';
      blankOption.textContent = 'Selecciona un encargado';
      selectNombres.appendChild(blankOption);
  
      dataAdmin.forEach((usuario) => {
        const option = document.createElement('option');
        option.value = usuario.id_asignacion_user;
        option.textContent = `${usuario.nombre_colaborador} ${usuario.apellido_colaborador}`;
        selectNombres.appendChild(option);
      });
  
      selectNombres.addEventListener('change', () => {
        globalidAsignacion = selectNombres.value;
        console.log('globalidAsignacion actualizado:', globalidAsignacion);
  
        const usuarioSeleccionado = dataAdmin.find(usuario => usuario.id_asignacion_user === parseInt(globalidAsignacion, 10));
        if (usuarioSeleccionado) {
          telefonoAdmins = usuarioSeleccionado.telefono_colaborador;
          nombreTransfer = usuarioSeleccionado.nombre_colaborador;
          console.log('telefonoAdmins:', telefonoAdmins);
          console.log('nombreTransfer:', nombreTransfer);
        } else {
          console.log('Usuario no encontrado.');
        }
      });
  
    } catch (error) {
      console.error('Error al obtener datos de administradores:', error);
    }
  }
  
  


  async function actualizarAsignacionUser(id_incidente, nuevo_id_asignacion_user) {
    console.log("Llegue", id_incidente);
    console.log("Llegue", nuevo_id_asignacion_user);

    try {
      const respuesta = await fetch('/actualizarAsignacionUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id_incidente, nuevo_id_asignacion_user })
      });

      const data = await respuesta.json();
      console.log('Respuesta de actualización:', data);

      if (data.success) {
        console.log(`Campo id_asignacion_user en incidente ${id_incidente} actualizado.`);


        mostrarMensaje('La transferencia fue exitosa', 'success');
        $('.modalTrasferencia').css('display', 'none');
        setTimeout(() => {
          location.reload();
        }, 2000);

      } else {
        console.error('Error al actualizar el campo id_asignacion_user.');
        // Muestra un mensaje de error
        mostrarMensaje('Error al actualizar el campo id_asignacion_user', 'error');
      }
    } catch (error) {
      console.error('Error en la solicitud de actualización:', error);
      // Muestra un mensaje de error
      mostrarMensaje('Error en la solicitud de actualización', 'error');
    }
  }


  function mostrarMensaje(mensaje, tipo) {
    const mensajeContainer = document.getElementById('mensaje-container');

    // Crear elemento para el mensaje
    const mensajeElemento = document.createElement('div');
    mensajeElemento.className = `mensaje ${tipo}`;
    mensajeElemento.textContent = mensaje;

    // Agregar el mensaje al contenedor
    mensajeContainer.innerHTML = '';
    mensajeContainer.appendChild(mensajeElemento);

    // Desaparecer el mensaje después de unos segundos (puedes ajustar el tiempo)
    setTimeout(() => {
      mensajeContainer.innerHTML = '';
    }, 2000); // Desaparecerá después de 5 segundos
  }

  async function enviarMensajeTelegram(telefonoColaborador, mensajeTelegram) {
    const url = `/enviarMensajeTelegram`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ telefono_colaborador: telefonoColaborador, mensajeTelegram: mensajeTelegram })
      });

      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  }
  async function enviarMensajeTelegram(telefonoColaborador, mensajeTelegram) {
    const url = `/enviarMensajeTelegram`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ telefono_colaborador: telefonoColaborador, mensajeTelegram: mensajeTelegram })
      });

      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  }




});
