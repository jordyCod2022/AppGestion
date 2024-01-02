document.addEventListener('DOMContentLoaded', () => {
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
});
