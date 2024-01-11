document.addEventListener('DOMContentLoaded', () => {
  const storedDashboardFecha = localStorage.getItem('dashboardFecha');
  const storedIdAsignacionUser = localStorage.getItem('idAsignacionUser');

  console.log(storedDashboardFecha);
  console.log(storedIdAsignacionUser);

  // Obtener y mostrar incidencias
  getAndShowIncidencias(storedIdAsignacionUser, storedDashboardFecha);
});

let filaSeleccionada = null;

function showAndProcessIncidencias(incidencias) {
  const tablaIncidencias = $('#tablaIncidencias').DataTable({
    destroy: true, // Destruye la DataTable existente si existe
    data: incidencias,
    columns: [
      { data: 'id_incidente', title: 'ID Incidente' },
      { data: 'nombre_colaborador', title: 'Nombre Colaborador' },
      { data: 'incidente_descrip', title: 'Descripción' },
      { data: 'estado', title: 'Estado', render: function (data) {
        return data === 2 ? 'Pendiente' : 'Cerrado';
      }},
      {
        data: null,
        title: 'Acción',
        render: function (data, type, row) {
          console.log(row.telefono_colaborador)
          console.log(row.id_incidente)
          const informarButton = `<button onclick="informarIncidente('${row.telefono_colaborador}', ${row.id_incidente})">Informar</button>`;

          console.log("Data")
          console.log(JSON.stringify(row))
          const realizadoButton = `<button onclick="abrirConfirmacionModal(${JSON.stringify(row)}, this)">Realizado</button>`;
          return informarButton + realizadoButton;
        }
      }
    ]
  });

  // Manejar eventos de clic en las filas
  $('#tablaIncidencias tbody').on('click', 'tr', function () {
    // Obtener los datos de la fila seleccionada
    const data = tablaIncidencias.row(this).data();
    console.log('Fila seleccionada:', data);

    // Guardar la fila seleccionada para su posterior uso
    filaSeleccionada = this;
  });

  // Agregar la DataTable al contenedor
  const incidenciasContainer = document.getElementById('incidenciasContainer');
  incidenciasContainer.innerHTML = ''; // Limpiar contenido antes de agregar la DataTable
  incidenciasContainer.appendChild(tablaIncidencias.table().container());
}

function informarIncidente(telefonoColaborador, idIncidencia) {
  const modal = document.getElementById('modal');
  modal.style.display = 'block';
  modal.setAttribute('data-telefono', telefonoColaborador);
  modal.setAttribute('data-id-incidencia', idIncidencia);
  filaSeleccionada = filaSeleccionada || document.querySelector('#tablaIncidencias tbody tr');
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
// ... (Resto de tu código)


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

async function realizarIncidente(idIncidencia, fila) {
  // Verifica si hay una fila seleccionada
  if (!fila) {
    console.error('Error: No hay fila seleccionada para la incidencia');
    return false;
  }

  try {
    // Realiza una solicitud HTTP para cerrar la incidencia en el servidor
    const response = await fetch('/cerrarIncidencia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id_incidencia: idIncidencia })
    });

    const responseData = await response.json();

    if (responseData.success) {
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.reload(); // Puedes ajustar el tiempo de espera según sea necesario
      return true;
    } else {
      // Acción fallida
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
    // Obtener incidencias pendientes y cerradas
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

  // Asigna el ID de la incidencia y la fila al modal de confirmación
  confirmacionModal.setAttribute('data-id-incidencia', incidencia.id_incidente);
  confirmacionModal.setAttribute('data-fila', fila.rowIndex);
  filaSeleccionada = fila;
}

// Función para cerrar el modal de confirmación
function cerrarConfirmacionModal() {
  const confirmacionModal = document.getElementById('confirmacionModal');
  confirmacionModal.style.display = 'none';
}

// Función para confirmar el realizado desde el modal de confirmación
function confirmarRealizadoDesdeModal() {
  const confirmacionModal = document.getElementById('confirmacionModal');
  const idIncidencia = confirmacionModal.getAttribute('data-id-incidencia');
  const fila = confirmacionModal.getAttribute('data-fila');

  const resultado = realizarIncidente(idIncidencia, fila);


  return resultado


   
}

