document.addEventListener('DOMContentLoaded', () => {
  // Recupera los datos almacenados en localStorage
  const storedNombreData = localStorage.getItem('nombreData');
  const nombreData = storedNombreData ? JSON.parse(storedNombreData) : null;

  // Actualiza el contenido del span con el nombre del usuario
  if (nombreData && nombreData.nombre) {
    const userWelcomeSpan = document.querySelector('.user-welcome span');
    userWelcomeSpan.textContent = 'Bienvenido, ' + nombreData.nombre;
    history.replaceState(null, '', window.location.href);
  } else {
    console.log('No hay datos disponibles en el dashboard');
    window.location.replace('../../index.html');
  }

  // Agrega la funcionalidad al botón de cerrar sesión
  const logoutButton = document.querySelector('.logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      const confirmLogout = confirm('¿Estás seguro de cerrar sesión?');
      if (confirmLogout) {
        localStorage.removeItem('nombreData');
        window.location.replace('../../index.html');
      }
    });
  } else {
    console.log('No se encontró el botón de cerrar sesión');
  }
});
