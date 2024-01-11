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
    destroy: true,
    data: incidencias,
    dom: 'Blfrtip', // Agregado para incluir los botones en la parte superior
    buttons: [
    {
      extend: 'excelHtml5',
      text: '<i class="material-icons" style="color: red;">file_download</i>',
    },
      
      {
        extend: 'pdfHtml5',
        text: '<i class="material-icons" style="color: #006400;">picture_as_pdf</i>',
        customize: function (doc) {
          doc.defaultStyle.fontSize = 10; // Ajusta el tamaño de la fuente en el PDF según sea necesario
        }
      },
      'print'
    ],
    columns: [
      { data: 'id_incidente', title: 'ID Incidente' },
      { data: 'nombre_colaborador', title: 'Nombre Colaborador' },
      { data: 'incidente_descrip', title: 'Descripción' },
      { data: 'estado', title: 'Estado', render: function (data) {
        return data === 2 ? 'Cerrado' : 'Pendiente';
      }},
      {
        data: null,
        title: 'Acción',
        render: function (data, type, row) {
          const informarButton = `<button class="informar-button" onclick="informarIncidente('${row.telefono_colaborador}', ${row.id_incidente})"><i class="material-icons">info</i></button>`;

          const realizadoButton = `<button class="realizado-button" onclick="abrirConfirmacionModal(${row.id_incidente}, ${JSON.stringify(row).replace(/"/g, '&quot;')}, this)"><i class="material-icons">done</i></button>`;

          return informarButton + realizadoButton;
        }
      }
    ],
    pageLength: 8,
    // Agregar control de selección para cambiar la cantidad de registros por página
    lengthMenu: [8, 15, 30],
  });

  $('#tablaIncidencias tbody').on('click', 'tr', function () {
    const data = tablaIncidencias.row(this).data();
    console.log('Fila seleccionada:', data);
    filaSeleccionada = this;
  });

  const incidenciasContainer = document.getElementById('incidenciasContainer');
  incidenciasContainer.innerHTML = '';
  incidenciasContainer.appendChild(tablaIncidencias.table().container());
}

function exportarDataTable() {
  console.log("EXPORTA")
  $('#tablaIncidencias').DataTable().button('excelHtml5').trigger();
}

function imprimirDataTable() {
  console.log("IMPRIME")
  $('#tablaIncidencias').DataTable().button('print').trigger();
}

function guardarPdfDataTable() {
  console.log("GUARDA")
  $('#tablaIncidencias').DataTable().button('pdfHtml5').trigger();
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

  if (filaSeleccionada) {
    const nombre = filaSeleccionada.querySelector('td:nth-child(2)').textContent;
    const id = filaSeleccionada.querySelector('td:nth-child(1)').textContent;
    const descripcion = filaSeleccionada.querySelector('td:nth-child(3)').textContent;

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

    alert(`Mensaje enviado con exito`);
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
      await new Promise(resolve => setTimeout(resolve, 500));

      const telefonoColaborador = fila.querySelector('td:nth-child(5)').textContent; // Ajusta el índice según la posición de la columna
      const idIncidencia = fila.querySelector('td:nth-child(1)').textContent;
      const problema = fila.querySelector('td:nth-child(3)').textContent;

      console.log(telefonoColaborador)
      console.log(idIncidencia)
      console.log(problema)

      // Crear mensaje con emojis
      const mensajeTelegram = `✅ Tu incidencia con ID ${idIncidencia} (${problema}) ha sido resuelta. ¡Gracias por tu paciencia! 🎉`;

      // Llamar a la función para enviar el mensaje a Telegram
      enviarMensajeTelegram(telefonoColaborador, mensajeTelegram);

      window.location.reload();
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

function abrirConfirmacionModal(idIncidencia, incidenciaData, fila) {
  const confirmacionModal = document.getElementById('confirmacionModal');
  confirmacionModal.style.display = 'block';
  confirmacionModal.setAttribute('data-id-incidencia', idIncidencia);
  confirmacionModal.setAttribute('data-fila', fila.rowIndex);
  filaSeleccionada = fila;
  console.log('Datos de la incidencia:', incidenciaData);
}


function cerrarConfirmacionModal() {
  const confirmacionModal = document.getElementById('confirmacionModal');
  confirmacionModal.style.display = 'none';
}

function confirmarRealizadoDesdeModal() {
  const confirmacionModal = document.getElementById('confirmacionModal');
  const idIncidencia = confirmacionModal.getAttribute('data-id-incidencia');
  const fila = confirmacionModal.getAttribute('data-fila');

  realizarIncidente(idIncidencia, fila);
}
