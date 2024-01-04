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
        informarIncidente(incidencia.telefono_colaborador, fila);
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
let filaSeleccionada = null;


// Función para simular acción al informar incidente
function informarIncidente(telefonoColaborador, fila) {
  // Muestra el modal
  const modal = document.getElementById('modal');
  modal.style.display = 'block';

  // Guarda el teléfono del colaborador y la fila en atributos del modal
  modal.setAttribute('data-telefono', telefonoColaborador);
  modal.setAttribute('data-fila', fila.rowIndex);
  filaSeleccionada = fila;
}
function autogenerarMensaje() {
  const mensajeInput = document.getElementById('mensajeInput');

  // Verifica si hay una fila seleccionada
  if (filaSeleccionada) {
    const nombre = filaSeleccionada.querySelector('td:nth-child(2)').textContent;
    const id = filaSeleccionada.querySelector('td:nth-child(1)').textContent;
    const descripcion = filaSeleccionada.querySelector('td:nth-child(3)').textContent;

    // Plantillas de mensajes
    const plantillas = [
      '👋 Hola {nombre}, tu incidencia con ID {idIncidencia} está siendo atendida. En unos minutos te notificaremos su avance.\nDescripción: {descripcion} 🛠️',
      '🙏 Estimado/a {nombre}, gracias por informarnos. Estamos trabajando para resolver tu incidencia con ID {idIncidencia}.\nDescripción: {descripcion} 🚧',
      '👋 Hola {nombre}, hemos recibido tu reporte con ID {idIncidencia}. Estamos investigando la situación.\nDescripción: {descripcion} 🕵️',
      '👋 Saludos {nombre}, estamos tomando medidas para resolver tu incidencia con ID {idIncidencia}. Pronto recibirás más información.\nDescripción: {descripcion} 🚀',
      '🚀 ¡Hola {nombre}!, tu reporte con ID {idIncidencia} ha sido registrado. Estamos trabajando en ello.\nDescripción: {descripcion} 🌟'
    ];
    

    // Selecciona aleatoriamente una plantilla
    const plantillaAleatoria = plantillas[Math.floor(Math.random() * plantillas.length)];

    // Reemplaza placeholders en la plantilla con datos de la incidencia seleccionada
    const mensajePersonalizado = plantillaAleatoria
      .replace('{nombre}', nombre)
      .replace('{idIncidencia}', id)
      .replace('{descripcion}', descripcion);

    // Asigna el mensaje personalizado al cuadro de texto
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
      throw new Error('Error en la solicitud');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}


// Función para marcar la incidencia como "Realizado"
async function realizarIncidente(idIncidencia) {
  // Muestra una ventana de confirmación
  const confirmacion = confirm(`¿Estás seguro de marcar la incidencia con ID ${idIncidencia} como "Realizado"?`);


  // Verifica la respuesta del usuario
  if (confirmacion) {
    try {
      // Realiza una solicitud HTTP para cerrar la incidencia en el servidor
      const response = await fetch('/cerrarIncidencia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Puedes agregar otros encabezados según sea necesario
        },
        body: JSON.stringify({ id_incidencia: idIncidencia })
      });

      const responseData = await response.json();

      if (responseData.success) {
        // Acción exitosa
        alert(`Incidencia ${idIncidencia} cerrada con éxito`);
        location.reload();
      } else {
        // Acción fallida
        alert(`Error al cerrar la incidencia ${idIncidencia}`);
      }
    } catch (error) {
      console.error('Error en la solicitud HTTP:', error);
      alert('Error al realizar la solicitud HTTP');
    }
  } else {
    // No realiza la acción si el usuario cancela la confirmación
    console.log('Acción de cerrar incidencia cancelada por el usuario');
  }
}

