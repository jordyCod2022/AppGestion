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
    showTotalesIncidencias(totalesData);
    console.log('Resultados de incidencias:', totalesData);
  }
});

function showTotalesIncidencias(totalesData) {
  // Mapea los íconos a sus respectivos estados
  const iconMapping = {
    'total_pendientes': 'error', // Ícono para Tickets Pendientes
    'total_cerrados': 'check_circle', // Ícono para Tickets Resueltos
  };

  // Itera sobre los datos de totales y actualiza los elementos correspondientes
  Object.keys(totalesData).forEach(key => {
    const iconName = iconMapping[key];
    const ticketCountElement = document.querySelector(`.dashboard-item .${iconName} .ticket-count`);

    if (ticketCountElement) {
      ticketCountElement.textContent = totalesData[key] || '0';
    }
  });
}