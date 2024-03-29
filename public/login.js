document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.getElementById('loginButton');
  const loader = document.getElementById('loader');

  loginButton.addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Mostrar el loader
    loader.style.display = 'block';

    const authenticated = await attemptLogin(username, password);

    // Ocultar el loader después de la autenticación
   

    if (authenticated) {

      setTimeout(() => {
        loader.style.display = 'none';
      }, 4000);
    
      // Realizar automáticamente la llamada a /getNombre después del inicio de sesión exitoso
      const nombreResponse = await fetch('/getNombre?username=' + username);
      const nombreData = await nombreResponse.json();
    

      // Almacena los datos en localStorage, incluyendo id_colaborador
      localStorage.setItem('nombreData', JSON.stringify(nombreData));
    
      // Redirigir o realizar acciones adicionales después del inicio de sesión exitoso
      window.location.href = '/protected/dashboard/dashboard.html';
    } else {
      alert('Nombre de usuario o contraseña incorrectos');
      loader.style.display = 'none';
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


