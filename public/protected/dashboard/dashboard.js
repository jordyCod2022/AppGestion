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
});
