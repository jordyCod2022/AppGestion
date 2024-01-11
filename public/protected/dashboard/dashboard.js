document.addEventListener('DOMContentLoaded', async () => {
  // Recupera los datos almacenados en localStorage
  const storedNombreData = localStorage.getItem('nombreData');
  const nombreData = storedNombreData ? JSON.parse(storedNombreData) : null;
  const nombreUser = document.getElementById('myContainer');

  nombreUser.querySelector('#usuarioInfo').textContent = nombreData.nombre || 'N/A';

  console.log(nombreData)
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
    console.error('No se encontró el botón de cerrar sesión');
  }

  // Obtiene el elemento aside
  const menuAside = document.getElementById('menuAside');

  // Obtiene el elemento del ícono de menú
  const menuIcon = document.querySelector('.menu');

  // Agrega un evento de clic al ícono de menú
  menuIcon.addEventListener('click', () => {
    menuAside.classList.toggle('show');

    // Revisa si la clase "show" está presente en el aside
    const isMenuVisible = menuAside.classList.contains('show');

    // Cambia la anchura del aside en consecuencia
    menuAside.style.width = isMenuVisible ? '60px' : '235px';

    // Cambiar el ancho de article
    article.style.marginLeft = isMenuVisible ? '1%' : '1%';
    const container = document.getElementById('myContainer');

    container.style.display = isMenuVisible ? 'none' : 'block';
  });

  // Obtener elementos del DOM
  const currentDateContainer = document.querySelector('.current-date-container');

  // Crear elemento para la fecha
  const dateContainer = document.createElement('span');

  var dropdown = document.querySelector('.dropdown');

  dropdown.addEventListener('click', function() {
    this.classList.toggle('active');
  });

  var opcionesMenu = document.querySelectorAll('.dropdown ul li');

  opcionesMenu.forEach(function(opcion) {
    opcion.addEventListener('click', function() {
      // Remover cualquier clase de color previa
      opcionesMenu.forEach(function(opcion) {
        opcion.classList.remove('color-opcion1', 'color-opcion2');
      });

      if (this.textContent === 'Deep Purple') {
        this.classList.add('color-opcion1');
        cambiarColores('#3c1361', 'none');
      } else if (this.textContent === 'Teal') {
        this.classList.add('color-opcion2');
        cambiarColores('#042e27', 'repeating-linear-gradient(45deg, #92c9b1, #92c9b1 20px, #b3e0d2 20px, #b3e0d2 40px)');
      } else if (this.textContent === 'Space') {
        // Establecer el estilo específico para 'Space'
        var article = document.getElementById('article');
        if (article) {
          article.style.width = '100%';
          article.style.height = '100%';
          article.style.background = 'radial-gradient(circle at 10% 10%, #3e73f0 5%, transparent 5%), ' +
            'radial-gradient(circle at 90% 10%, #3e73f0 5%, transparent 5%), ' +
            'radial-gradient(circle at 90% 90%, #3e73f0 5%, transparent 5%), ' +
            'radial-gradient(circle at 10% 90%, #3e73f0 5%, transparent 5%)';
          article.style.backgroundSize = '20px 20px';
          article.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
        }
        var header = document.querySelector('header');
        if (header) {
          header.style.backgroundColor = '#1b2838';
        }
      } else {
        // Para otras opciones, mantener el comportamiento actual
        cambiarColores('#1b2838', '');
      }
    });
  });

  // Función para cambiar los colores y estilos del header, aside y article
  function cambiarColores(color, articleStyle) {
    // Cambiar color del header
    var header = document.querySelector('header');
    if (header) {
      header.style.backgroundColor = color;
    }

    // Cambiar color del aside
    var aside = document.querySelector('aside');
    if (aside) {
      aside.style.backgroundColor = color;
    }

    // Cambiar estilos del article
    var article = document.getElementById('article');
    if (article) {
      article.style.background = articleStyle;
    }
  }
  


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
  currentDateContainer.appendChild(dateContainer);

  // Configurar flatpickr para el selector de fecha
  const flatpickrInstance = flatpickr('.Btn', {
    dateFormat: 'Y-m-d',
    onClose: function (selectedDates, dateStr) {
      dateContainer.innerText = dateStr;

      // Actualizar los totales de incidencias con la nueva fecha
      updateTotalesIncidencias(dateStr);
      updateGrafica(dateStr);
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
            backgroundColor: 'rgba(173, 216, 230, 0.5)', // Celeste con transparencia

            borderColor: 'rgba(173, 216, 230, 1)', // Celeste sólido para los bordes
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y',
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                color: 'white'
              }
            },
            y: {
              ticks: {
                color: 'white'
              }
            }
          },
          plugins: {
            legend: {
              labels: {
                color: 'white'
              }
            }
          }
        }
      });
    }
  }

  
  
});
