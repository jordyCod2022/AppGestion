document.addEventListener('DOMContentLoaded', async () => {
  // Recupera los datos almacenados en localStorage
  const storedNombreData = localStorage.getItem('nombreData');
  const nombreData = storedNombreData ? JSON.parse(storedNombreData) : null;
  const nombreUser = document.getElementById('myContainer');

  getTotalIncidentesSemanaNueva(nombreData.id_colaborador,getCurrentDate())

  


  console.log(nombreData)
  updateTotalesIncidencias(getCurrentDate());
  updateGrafica(getCurrentDate());
  updateGraficaLineal(getCurrentDate());

  // Agrega la funcionalidad al botón de cerrar sesión
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


  // Obtener elementos del DOM
  const currentDateContainer = document.querySelector('.current-date-container');

  // Crear elemento para la fecha
  const dateContainer = document.createElement('span');

  var dropdown = document.querySelector('.dropdown');


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

      // Actualizar los totales de incidencias con la nueva fecha
      updateTotalesIncidencias(dateStr);
      updateGrafica(dateStr);
      getCurrentDate(dateStr);
      updateGraficaLineal(dateStr)
      getTotalIncidentesSemanaNueva(nombreData.id_colaborador,dateStr);
      localStorage.setItem('dashboardFecha', dateStr);
    },
  });

  async function getTotalIncidentesSemanaNueva(idAsignacionUser, fechaParametro) {
    try {
      // Obtener datos de incidencias con la nueva fecha usando la nueva ruta
      const totalesResponse = await fetch(`/getTotalIncidentesSemanaNueva?id_asignacion_user=${idAsignacionUser}&fechaIncidencia=${fechaParametro}`);
      const totalesData = await totalesResponse.json();
  
      // Verificar si totalesData es un array antes de mostrarlo
      if (Array.isArray(totalesData) && totalesData.length > 0) {
        const totalSemanaElement = document.getElementById('totalSemana');
        if (totalSemanaElement) {
          totalSemanaElement.textContent = totalesData[0].total_incidentes_semana.toString();
        } else {
          console.error('No se encontró el elemento con id "totalSemana"');
        }
  
        console.log('Resultados de total de incidentes en la semana:', totalesData);
      } else {
        console.error('El servidor no devolvió un array válido:', totalesData);
      }
    } catch (error) {
      console.error('Error al obtener los datos del servidor:', error);
    }
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



  const barChartContainer = document.getElementById('barChartContainer');

  // Obtener datos del servidor y actualizar el gráfico
  async function updateGrafica(newDate) {
    localStorage.setItem('dashboardFecha', newDate);
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
      window.barChart = new Chart(barChartContainer, {
        type: 'bar',
        data: {
          labels: etiquetas,
          datasets: [{
            label: 'Incidentes Reportados Por Usuario',
            data: datos,
            backgroundColor: 'rgba(0, 123, 255, 0.5)', // Azul claro con transparencia
            borderColor: 'rgba(0, 123, 255, 1)', // Azul sólido para los bordes

            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y',
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                color: 'black'
              }
            },
            y: {
              ticks: {
                color: 'black'
              }
            }
          },
          plugins: {
            legend: {
              labels: {
                color: 'black'
              }
            }
          }
        }
      });
    }
  }




  const lineChartContainer = document.getElementById('barLineContainer');

  // Obtener datos del servidor y actualizar el gráfico
 // Obtener datos del servidor y actualizar el gráfico
async function updateGraficaLineal(newDate) {
  localStorage.setItem('dashboardFecha', newDate);
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

        // Destruir el gráfico existente si hay uno
        if (window.lineChart) {
          window.lineChart.destroy();
        }

        // Crear arrays para etiquetas (días de la semana) y datos (cantidades)
        const etiquetas = totalesData.map(item => item.dia_semana);
        const datos = totalesData.map(item => item.total_incidentes);

        // Crear el gráfico de línea (polígono de frecuencias) con interpolación cúbica
        window.lineChart = new Chart(lineChartContainer, {
          type: 'line',
          data: {
            labels: etiquetas,
            datasets: [{
              label: 'Total de Incidentes en la Semana',
              data: datos,
              fill: true,
              backgroundColor: 'rgba(0, 255, 0, 0.3)',
              borderColor: 'rgba(0, 100, 0, 1)', // Verde oscuro para los bordes
              borderWidth: 2
            }]
          },
          options: {
            aspectRatio: 2,
            scales: {
              x: {
                beginAtZero: true,
                ticks: {
                  color: 'black'
                }
              },
              y: {
                precision: 0,
                ticks: {
                  color: 'black'
                }
              }
            },
            plugins: {
              legend: {
                labels: {
                  color: 'black'
                }
              }
            },
            elements: {
              line: {
                tension: 0.4 // Ajusta la tensión para controlar la curvatura
              }
            }
          }
        });
      } else {
        console.error('El servidor no devolvió un array válido:', totalesData);
      }
    } catch (error) {
      console.error('Error al obtener los datos del servidor:', error);
    }
  }
}




});
