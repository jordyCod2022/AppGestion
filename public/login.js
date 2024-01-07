document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.getElementById('loginButton');
  const loader = document.getElementById('loader');

  loginButton.addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Mostrar el loader
    loader.style.display = 'block';

    const authenticated = await attemptLogin(username, password);

    if (authenticated) {
      // Esperar 3 segundos (3000 milisegundos) antes de ocultar el loader
      setTimeout(() => {
        // Ocultar el loader después de 3 segundos
        loader.style.display = 'none';

        // Realizar automáticamente la llamada a /getNombre después del inicio de sesión exitoso
        const nombreResponse = await fetch('/getNombre?username=' + username);
        const nombreData = await nombreResponse.json();

        // Almacena los datos en localStorage, incluyendo id_colaborador
        localStorage.setItem('nombreData', JSON.stringify(nombreData));

        // Redirigir o realizar acciones adicionales después del inicio de sesión exitoso
        window.location.href = '/protected/dashboard/dashboard.html';
      }, 3000);
    } else {
      // Ocultar el loader en caso de fallo de autenticación
      loader.style.display = 'none';
      alert('Nombre de usuario o contraseña incorrectos');
    }
  });

  async function attemptLogin(username, password) {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    return data.authenticated;
  }
});
