document.addEventListener('DOMContentLoaded', () => {
  // Recupera los datos almacenados en localStorage
  const storedNombreData = localStorage.getItem('nombreData');
  const nombreData = storedNombreData ? JSON.parse(storedNombreData) : null;

  // Actualiza el contenido del span con el nombre del usuario
  if (nombreData && nombreData.nombre) {
    const userWelcomeSpan = document.querySelector('.user-welcome span');
    userWelcomeSpan.textContent = 'Bienvenido, ' + nombreData.nombre;
  } else {
    console.log('No hay datos disponibles en el dashboard');
  }

  // Agrega la funcionalidad al botón de cerrar sesión
  const logoutButton = document.querySelector('.logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      const confirmLogout = confirm('¿Estás seguro de cerrar sesión?');
      if (confirmLogout) {
        // Limpiar datos de localStorage y redirigir a la página de inicio de sesión
        localStorage.removeItem('nombreData');
        window.location.href ='./././index.html'; // Redirige y reemplaza la entrada en el historial
      }
    });
  } else {
    console.log('No se encontró el botón de cerrar sesión');
  }
});
