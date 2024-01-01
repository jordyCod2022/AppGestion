document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const authenticated = await attemptLogin(username, password);

    if (authenticated) {
      alert('Inicio de sesión exitoso');
    
      // Realizar automáticamente la llamada a /getNombre después del inicio de sesión exitoso
      const nombreResponse = await fetch('/getNombre?username=' + username);
      const nombreData = await nombreResponse.json();
    
      // Almacena los datos en localStorage
      localStorage.setItem('nombreData', JSON.stringify(nombreData));
    
      // Redirigir o realizar acciones adicionales después del inicio de sesión exitoso
      window.location.href = '/protected/dashboard/dashboard.html';
    } else {
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
