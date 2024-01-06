document.addEventListener('DOMContentLoaded', () => {
  const storedDashboardFecha = localStorage.getItem('dashboardFecha');
  const storedIdAsignacionUser = localStorage.getItem('idAsignacionUser');

  console.log(storedDashboardFecha);
  console.log(storedIdAsignacionUser);

  // Obtener y mostrar incidencias
  getAndShowIncidencias(storedIdAsignacionUser, storedDashboardFecha);
});

let filaSeleccionada = null;

function createTableRow(incidencia) {
  const fila = document.createElement('tr');
  fila.insertCell(0).textContent = incidencia.id_incidente;
  fila.insertCell(1).textContent = incidencia.nombre_colaborador;
  fila.insertCell(2).textContent = incidencia.incidente_descrip;
  fila.insertCell(3).textContent = incidencia.id_estado === 2 ? 'Pendiente' : 'Cerrado';

  const celdaAccion = fila.insertCell(4);
  createActionButton('Informar', () => {
    informarIncidente(incidencia);
    autogenerarMensaje(incidencia);
  }, celdaAccion);

  createActionButton('Realizado', () => abrirConfirmacionModal(incidencia, fila), celdaAccion);

  return fila;
}

function createActionButton(texto, onclickHandler, contenedor) {
  const boton = document.createElement('button');
  boton.textContent = texto;
  boton.onclick = onclickHandler;
  contenedor.appendChild(boton);
}

function showAndProcessIncidencias(incidencias) {
  const incidenciasContainer = document.getElementById('incidenciasContainer');

  if (incidencias.length > 0) {
    const tablaIncidencias = document.createElement('table');
    tablaIncidencias.border = '1';

    const cabecera = tablaIncidencias.createTHead();
    const filaCabecera = cabecera.insertRow();
    filaCabecera.innerHTML = '<th>ID Incidente</th><th>Nombre Colaborador</th><th>Descripción</th><th>Estado</th><th>Acción</th>';

    const cuerpoTabla = tablaIncidencias.createTBody();
    
    incidencias.forEach(incidencia => {
      const fila = createTableRow(incidencia);
      cuerpoTabla.appendChild(fila);
    });

    incidenciasContainer.appendChild(tablaIncidencias);
  } else {
    const mensajeElement = document.createElement('p');
    mensajeElement.textContent = 'No hay incidencias para mostrar';
    incidenciasContainer.appendChild(mensajeElement);
  }
}

function informarIncidente(incidencia) {
  const telefonoColaborador = incidencia.telefono_colaborador;
  const modal = document.getElementById('modal');
  modal.style.display = 'block';
  modal.setAttribute('data-telefono', telefonoColaborador);
  modal.setAttribute('data-fila', filaSeleccionada.rowIndex);
  filaSeleccionada = filaSeleccionada;
}

function autogenerarMensaje(incidencia) {
  const mensajeInput = document.getElementById('mensajeInput');

  if (filaSeleccionada) {
    const nombre = incidencia.nombre_colaborador;
    const id = incidencia.id_incidente;
    const descripcion = incidencia.incidente_descrip;

    const plantillas = [
      '👋 Hola {nombre}, tu incidencia con ID {idIncidencia} está siendo atendida. En unos minutos te notificaremos su avance.\nDescripción: {descripcion} 🛠️',
      '🙏 Estimado/a {nombre}, gracias por informarnos. Estamos trabajando para resolver tu incidencia con ID {idIncidencia}.\nDescripción: {descripcion} 🚧',
      '👋 Hola {nombre}, hemos recibido tu reporte con ID {idIncidencia}. Estamos investigando la situación.\nDescripción: {descripcion} 🕵️',
      '👋 Saludos {nombre}, estamos tomando medidas para resolver tu incidencia con ID {idIncidencia}. Pronto recibirás más información.\nDescripción: {descripcion} 🚀',
      '🚀 ¡Hola {nombre}!, tu reporte con ID {idIncidencia} ha sido registrado. Estamos trabajando en ello.\nDescripción: {descripcion} 🌟'
    ];

    const plantillaAleatoria = plantillas[Math.floor(Math.random() * plantillas.length)];

    const mensajePersonalizado = plantillaAleatoria
      .replace('{nombre}', nombre)
      .replace('{idIncidencia}', id)
      .replace('{descripcion}', descripcion);

    mensajeInput.value = mensajePersonalizado;
  }
}

function regresar() {
  window.history.back();
}

function cerrarModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
  document.getElementById('mensajeInput').value = '';
  filaSeleccionada = null;
}

function informarDesdeModal() {
  const modal = document.getElementById('modal');
  const telefonoColaborador = modal.getAttribute('data-telefono');
  const mensajeUsuario = document.getElementById('mensajeInput').value;

  if (mensajeUsuario) {
    enviarMensajeTelegram(telefonoColaborador, mensajeUsuario)
      .then(response => {
        console.log('Mensaje enviado correctamente', response);
      })
      .catch(error => {
        console.error('Error al enviar mensaje:', error);
      });

    alert(`Mensaje enviado con éxito`);
    cerrarModal();
  }
}

async function enviarMensajeTelegram(telefonoColaborador, mensajeTelegram) {
  const url = `/enviarMensajeTelegram`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ telefono_colaborador: telefonoColaborador, mensajeTelegram: mensajeTelegram })
    });

    if (!response.ok) {
      throw new Error('Error en la solicitud');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

async function realizarIncidente(idIncidencia, fila) {
  if (!fila) {
    console.error('Error: No hay fila seleccionada para la incidencia');
    return false;
  }

  try {
    const response = await fetch('/cerrarIncidencia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id_incidencia: idIncidencia })
    });

    const responseData = await response.json();

    if (responseData.success) {
      await enviarMensajeTelegram(telefonoColaborador, 'Tu incidencia fue resuelta');
      // window.location.reload();  // Si decides no recargar la página
      return true;
    } else {
      alert(`Error al cerrar la incidencia ${idIncidencia}`);
      return false;
    }
  } catch (error) {
    console.error('Error en la solicitud HTTP:', error);
    alert('Error al realizar la solicitud HTTP');
    return false;
  }
}

async function getAndShowIncidencias(idAsignacionUser, fechaDashboard) {
  try {
    const response = await fetch(`/getIncidencias?id_asignacion_user=${idAsignacionUser}&fecha_incidencia=${fechaDashboard}`);
    const incidencias = await response.json();
    console.log('Respuesta de incidencias:', incidencias);
    showAndProcessIncidencias(incidencias);
  } catch (error) {
    console.error('Error al obtener y mostrar incidencias:', error);
  }
}

function abrirConfirmacionModal(incidencia, fila) {
  const confirmacionModal = document.getElementById('confirmacionModal');
  confirmacionModal.style.display = 'block';
  confirmacionModal.setAttribute('data-id-incidencia', incidencia.id_incidente);
  confirmacionModal.setAttribute('data-fila', fila.rowIndex);
  filaSeleccionada = fila;
}

function cerrarConfirmacionModal() {
  const confirmacionModal = document.getElementById('confirmacionModal');
  confirmacionModal.style.display = 'none';
}

function confirmarRealizadoDesdeModal() {
  const confirmacionModal = document.getElementById('confirmacionModal');
  const idIncidencia = confirmacionModal.getAttribute('data-id-incidencia');
  const filaIndex = confirmacionModal.getAttribute('data-fila');
  const fila = document.getElementById('tablaIncidencias').rows[filaIndex];

  const resultado = realizarIncidente(idIncidencia, fila);

  return resultado;
}
