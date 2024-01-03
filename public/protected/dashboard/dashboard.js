document.addEventListener('DOMContentLoaded', async () => {
  // Recupera los datos almacenados en localStorage
  const storedNombreData = localStorage.getItem('nombreData');
  const nombreData = storedNombreData ? JSON.parse(storedNombreData) : null;

  // Actualiza el contenido del span con el nombre del usuario
  if (nombreData && nombreData.nombre) {
    const userWelcomeSpan = document.querySelector('.user-welcome span');
    userWelcomeSpan.textContent = 'Bienvenido, ' + nombreData.nombre;
    history.pushState(null, null, window.location.href);
  } else {
    console.log('No hay datos disponibles en el dashboard');
  }

  // Agrega la funcionalidad al botón de cerrar sesión
  const logoutButton = document.querySelector('.logout-button');
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
    console.log('No se encontró el botón de cerrar sesión');
  }

  // Nuevo bloque de código para el menú aside
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

  // Recupera el id_colaborador y otros datos al cargar la página
  if (nombreData && nombreData.username) {
    const nombreResponse = await fetch('/getNombre?username=' + nombreData.username);
    const nombreDataUpdated = await nombreResponse.json();

    // Almacena los datos actualizados en localStorage
    localStorage.setItem('nombreData', JSON.stringify(nombreDataUpdated));

    // Utiliza el id_colaborador para obtener los totales de incidencias
    const idReportacionUser = nombreDataUpdated.id_colaborador;
    const totalesResponse = await fetch(`/getTotalesIncidencias?id_reportacion_user=${idReportacionUser}`);
    const totalesData = await totalesResponse.json();
    console.log('Resultados de incidencias:', totalesData);

    // Actualizar elementos HTML con los resultados
    const ticketsPendientesElement = document.getElementById('ticketsPendientes');
    const ticketsResueltosElement = document.getElementById('ticketsResueltos');

    if (ticketsPendientesElement && ticketsResueltosElement) {
      ticketsPendientesElement.querySelector('.ticket-count').textContent = totalesData.total_pendientes || 'N/A';
      ticketsResueltosElement.querySelector('.ticket-count').textContent = totalesData.total_cerrados || 'N/A';
    } else {
      console.error('Elementos no encontrados');
    }
  }

  // Obtener elementos del DOM
  const currentDateContainer = document.querySelector('.current-date-container');
  const changeDateButton = document.querySelector('.change-date-button');

  // Crear elemento para la fecha
  const dateContainer = document.createElement('span');

  // Función para obtener la fecha actual
  function getCurrentDate() {
    const currentDate = new Date();
    return currentDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Configurar la presentación de la fecha
  dateContainer.innerText = getCurrentDate();
  dateContainer.className = 'current-date';
  currentDateContainer.appendChild(dateContainer);

  // Configurar flatpickr para el selector de fecha
  const flatpickrInstance = flatpickr('.change-date-button', {
    dateFormat: 'Y-m-d',
    onClose: function (selectedDates, dateStr) {
      dateContainer.innerText = dateStr;

      // Obtener id_colaborador al cargar la página
      if (nombreData && nombreData.username) {
        const idReportacionUser = nombreData.id_colaborador;

        // Llamar a la función con los parámetros necesarios
        getAndShowIncidencias(idReportacionUser, dateStr);
      }
    },
  });

  // Función para obtener y mostrar incidencias
  async function getAndShowIncidencias(idReportacionUser, newDate) {
    try {
      // Obtener incidencias con la nueva fecha
      const incidenciasResponse = await fetch(`/getIncidencias?id_asignacion_user=${idReportacionUser}&fecha_incidencia=${newDate}`);
      const incidenciasData = await incidenciasResponse.json();
      console.log('Resultados de incidencias:', incidenciasData);

      // Actualizar elementos HTML con los resultados
      const incidenciasContainer = document.getElementById('incidenciasContainer');
      
      if (incidenciasContainer) {
        // Limpiar contenido actual
        incidenciasContainer.innerHTML = '';

        // Verificar si hay incidencias
        if (incidenciasData.length > 0) {
          incidenciasData.forEach(incidencia => {
            // Crear elementos HTML para cada incidencia
            const incidenciaElement = document.createElement('div');
            incidenciaElement.innerHTML = `
              <div>ID: ${incidencia.id_incidente}</div>
              <div>Nombre: ${incidencia.incidente_nombre}</div>
              <div>Descripción: ${incidencia.incidente_descrip}</div>
              <div>Fecha: ${incidencia.fecha_incidente}</div>
              <div>Colaborador: ${incidencia.nombre_colaborador} ${incidencia.apellido_colaborador}</div>
              <div>Teléfono: ${incidencia.telefono_colaborador}</div>
              <div>Estado: ${incidencia.id_estado}</div>
              <hr>
            `;
            // Agregar cada incidencia al contenedor
            incidenciasContainer.appendChild(incidenciaElement);
          });
        } else {
          incidenciasContainer.innerHTML = '<p>No hay incidencias disponibles.</p>';
        }
      } else {
        console.error('Contenedor de incidencias no encontrado');
      }
    } catch (error) {
      console.error('Error al obtener las incidencias:', error);
    }
  }
});
