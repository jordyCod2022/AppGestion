document.addEventListener('DOMContentLoaded', async () => {
    // Hacer una solicitud al backend para obtener el nombre del usuario
    const response = await fetch('/getNombre');
    const data = await response.json();

    // Actualizar el contenido del elemento con el nuevo nombre
    const userWelcomeElement = document.querySelector('.user-welcome span');
    userWelcomeElement.textContent = `Bienvenido, ${data.nombre || 'Usuario'}`;
  });