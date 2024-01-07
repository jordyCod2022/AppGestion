document.addEventListener('DOMContentLoaded', async () => {

  // Recupera los datos almacenados en localStorage
  const storedNombreData = localStorage.getItem('nombreData');
  const nombreData = storedNombreData ? JSON.parse(storedNombreData) : null;
  updateTotalesIncidencias(getCurrentDate());
  updateGrafica(getCurrentDate());


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
    console.log('No se encontró el botón de cerrar sesió');
  }


  // Obtiene el elemento aside
  var menuAside = document.getElementById('menuAside');

  // Obtiene el elemento del ícono de menú
  var menuIcon = document.querySelector('.menu');

  // Agrega un evento de clic al ícono de menú
  menuIcon.addEventListener('click', function () {
    menuAside.classList.toggle('show');

    // Revisa si la clase "show" está presente en el aside
    var isMenuVisible = menuAside.classList.contains('show');

    // Cambia la anchura del aside en consecuencia
    menuAside.style.width = isMenuVisible ? '300px' : '60px';
  });

  // Obtener elementos del DOM
  const currentDateContainer = document.querySelector('.current-date-container');
  const changeDateButton = document.querySelector('.Btn');

  // Crear elemento para la fecha
  const dateContainer = document.createElement('span');

  // Función para obtener la fecha actual
  function getCurrentDate() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;

  }


  // Configurar la prentación de la fecha
  dateContainer.innerText = getCurrentDate();
  dateContainer.className = 'current-date';
  currentDateContainer.appendChild(dateContainer);

  // Configurar flatpickr para el selector de fecha
  const flatpickrInstance = flatpickr('.Btn', {
    dateFormat: 'Y-m-d',
    onClose: function (selectedDates, dateStr) {
      dateContainer.innerText = dateStr;

      // Actualizar los totales de incidencias con la nueva fecha
      updateTotalesIncidencias(dateStr);
      updateGrafica(dateStr)
      localStorage.setItem('dashboardFecha', dateStr);
    },
  });

  // Función para actualizar los totales de incidencias con la nueva fecha
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
            label: 'Incidentes Reportados',
            data: datos,
            backgroundColor: 'rgba(255, 0, 0, 0.2)', // Rojo transparente para las barras
            borderColor: 'rgba(255, 0, 0, 1)', // Rojo sólido para los bordes de las barras
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y',
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                color: 'white' // Color blanco para las etiquetas en el eje X
              }
            },
            y: {
              ticks: {
                color: 'white' // Color blanco para las etiquetas en el eje Y
              }
            }
          },
          plugins: {
            legend: {
              labels: {
                color: 'white' // Color blanco para las letras en la leyenda
              }
            }
          }
        }
      });
    }
  }
  


  // ... (otro código)




});

