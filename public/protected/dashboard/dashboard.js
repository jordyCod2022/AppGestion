document.addEventListener('DOMContentLoaded', () => {
  // Recupera los datos almacenados en localStorage
  const storedNombreData = localStorage.getItem('nombreData');
  const nombreData = storedNombreData ? JSON.parse(storedNombreData) : null;

  // Hacer algo con los datos en el dashboard
  if (nombreData) {
    console.log('Datos en el dashboard:', nombreData);
    // Realiza las acciones necesarias con los datos en el dashboard
  } else {
    console.log('No hay datos disponibles en el dashboard');
  }
});
