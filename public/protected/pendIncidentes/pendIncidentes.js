document.addEventListener('DOMContentLoaded', () => {
  // Recupera las incidencias almacenadas en localStorage
  const storedIncidencias = localStorage.getItem('incidencias');
  const incidencias = storedIncidencias ? JSON.parse(storedIncidencias) : [];

  // Muestra las incidencias en la HTML
  const tablaIncidencias = document.createElement('table');
  tablaIncidencias.border = '1';

  if (incidencias.length > 0) {
    // Crea la cabecera de la tabla
    const cabecera = tablaIncidencias.createTHead();
    const filaCabecera = cabecera.insertRow();
    filaCabecera.innerHTML = '<th>ID Incidente</th><th>Nombre Colaborador</th><th>Descripción</th><th>Estado</th><th>Acción</th>';

    // Llena la tabla con los datos de incidencias
    const cuerpoTabla = tablaIncidencias.createTBody();
    incidencias.forEach(incidencia => {
      const fila = cuerpoTabla.insertRow();
      fila.insertCell(0).textContent = incidencia.id_incidente;
      fila.insertCell(1).textContent = incidencia.nombre_colaborador;
      fila.insertCell(2).textContent = incidencia.incidente_descrip;
      fila.insertCell(3).textContent = incidencia.id_estado === 2 ? 'Pendiente' : 'Cerrado';

      // Agregar botones con eventos onclick
      const celdaAccion = fila.insertCell(4);
      const botonInformar = document.createElement('button');
      botonInformar.textContent = 'Informar';
      botonInformar.onclick = function () {
        informarIncidente(incidencia.telefono_colaborador);
      };
      celdaAccion.appendChild(botonInformar);

      const botonRealizado = document.createElement('button');
      botonRealizado.textContent = 'Realizado';
      botonRealizado.onclick = function () {
        realizarIncidente(incidencia.id_incidente);
      };
      celdaAccion.appendChild(botonRealizado);
    });
  } else {
    const mensajeElement = document.createElement('p');
    mensajeElement.textContent = 'No hay incidencias para mostrar';
    document.body.appendChild(mensajeElement);
  }

  // Agrega la tabla al contenedor de incidencias
  const incidenciasContainer = document.getElementById('incidenciasContainer');
  incidenciasContainer.appendChild(tablaIncidencias);
});

function abrirModal(telefonoColaborador) {
  console.log('Abriendo modal para', telefonoColaborador);

  // Limpia el contenido del textarea del modal
  document.getElementById('mensajeUsuario').value = '';

  // Guarda el teléfono del colaborador en un atributo del botón enviar del modal
  const botonEnviar = document.getElementById('botonEnviar');
  botonEnviar.setAttribute('data-telefono-colaborador', telefonoColaborador);

  // Abre el modal
  $('#informarModal').modal('show');
}

// Función para enviar el mensaje del usuario
function enviarMensaje() {
  // Obtiene el mensaje del usuario desde el textarea del modal
  const mensajeUsuario = document.getElementById('mensajeUsuario').value;

  // Obtiene el teléfono del colaborador desde el atributo del botón enviar del modal
  const telefonoColaborador = document.getElementById('botonEnviar').getAttribute('data-telefono-colaborador');

  // Llama a la función para enviar mensaje a Telegram
  enviarMensajeTelegram(telefonoColaborador, mensajeUsuario)
    .then(response => {
      console.log('Mensaje enviado correctamente:', response);
    })
    .catch(error => {
      console.error('Error al enviar mensaje:', error);
    });

  // Simula la acción de informar incidente
  alert(`Informando incidente al colaborador con teléfono ${telefonoColaborador} y mensaje: ${mensajeUsuario}`);

  // Cierra el modal
  $('#informarModal').modal('hide');
}

// Función para simular acción al marcar incidente como realizado
function realizarIncidente(id) {
  alert(`Marcando incidente con ID ${id} como realizado`);
}


// Función para simular acción al informar incidente
function informarIncidente(telefonoColaborador) {
  // Pregunta al usuario por el mensaje usando un modal
  const mensajeUsuario = prompt('Ingrese el mensaje para informar el incidente:');

  // Si el usuario proporciona un mensaje, llama a la función para enviar mensaje a Telegram
  if (mensajeUsuario) {
    enviarMensajeTelegram(telefonoColaborador, mensajeUsuario)
      .then(response => {
        console.log('Mensaje enviad correctamente:', response);
      })
      .catch(error => {
        console.error('Error al enviar mensaje:', error);
      });

    // Simula la acción de informar incidente
    alert(`Informando incidente al colaborador con teléfono ${telefonoColaborador} y mensaje: ${mensajeUsuario}`);
  }
}

async function enviarMensajeTelegram(telefonoColaborador, mensajeTelegram) {
  const url = `/enviarMensajeTelegram`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // Puedes agregar otros encabezados según sea necesario
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
