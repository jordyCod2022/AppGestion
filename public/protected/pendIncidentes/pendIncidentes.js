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
        autogenerarMensaje(incidencia.nombre_colaborador, incidencia.id_incidente);
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

// Función para simular acción al informar incidente
function informarIncidente(telefonoColaborador) {
  // Muestra el modal
  const modal = document.getElementById('modal');
  modal.style.display = 'block';

  // Guarda el teléfono del colaborador en un atributo del modal
  modal.setAttribute('data-telefono', telefonoColaborador);
}

function autogenerarMensaje(nombre, id) {
  const mensajeInput = document.getElementById('mensajeInput');

  // Plantillas de mensajes
  const plantillas = [
    'Hola {nombre}, tu incidencia con ID {idIncidencia} está siendo atendida. En unos minutos te notificaremos su avance.',
    'Estimado/a {nombre}, gracias por informarnos. Estamos trabajando para resolver tu incidencia con ID {idIncidencia}.',
    'Hola {nombre}, hemos recibido tu reporte con ID {idIncidencia}. Estamos investigando la situación.',
    'Saludos {nombre}, estamos tomando medidas para resolver tu incidencia con ID {idIncidencia}. Pronto recibirás más información.',
    '¡Hola {nombre}!, tu reporte con ID {idIncidencia} ha sido registrado. Estamos trabajando en ello.'
  ];

  // Selecciona aleatoriamente una plantilla
  const plantillaAleatoria = plantillas[Math.floor(Math.random() * plantillas.length)];

  // Reemplaza placeholders en la plantilla con datos de la incidencia seleccionada
  const mensajePersonalizado = plantillaAleatoria
    .replace('{nombre}', nombre)
    .replace('{idIncidencia}', id);

  // Asigna el mensaje personalizado al cuadro de texto
  mensajeInput.value = mensajePersonalizado;
}


// Función para cerrar el modal
function cerrarModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
  document.getElementById('mensajeInput').value = '';

}

// Función para informar desde el modal
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

    // Simula la acción de informar incidente
    alert(`Mensaje enviado con exito`);

    // Cierra el modal después de informar
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
        // Puedes agregar otros encabezados según sea necesario
      },
      body: JSON.stringify({ telefono_colaborador: telefonoColaborador, mensajeTelegram: mensajeTelegram })
    });

    if (!response.ok) {
      throw new Error('Error en la solicitu');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}
