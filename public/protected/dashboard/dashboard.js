document.addEventListener('DOMContentLoaded', async () => {
    try {
      // Hacer una solicitud al backend para obtener el nombre del usuario
      const response = await fetch(`/getNombre?username=${nombreDeUsuario}`);
      const data = await response.json();
  
      // Verificar la respuesta completa en la consola
      console.log('Respuesta del servidor:', data);
  
      // Actualizar el contenido del elemento con el nuevo nombre
      const userWelcomeElement = document.querySelector('.user-welcome span');
      userWelcomeElement.textContent = `Bienvenido, ${data.nombre || 'Usuario'}`;
    } catch (error) {
      console.error('Error al obtener el nombre del usuario:', error);
    }
  });
  