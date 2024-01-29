let telefonoSeleccionado;
let descripSeleccionado;

document.addEventListener('DOMContentLoaded', () => {
  const storedDashboardFecha = localStorage.getItem('dashboardFecha');
  const storedIdAsignacionUser = localStorage.getItem('idAsignacionUser');
  const storedAvatarUrl = localStorage.getItem('avatarUrl');
  const items = document.querySelectorAll("#IconosAside li");
  var iconoSegundo = document.querySelector('#IconosAside li:nth-child(2)');
  const storedNombreData = localStorage.getItem('nombreData');
  const nombreData = storedNombreData ? JSON.parse(storedNombreData) : null;
  console.log(nombreData)
  const enviarNombre = document.querySelector('.nombreUsuarioActual');
  

  iconoSegundo.classList.add('seleccionado');
  nombreSesionActual = `${nombreData.nombre}`;
  apellidoSesionActual = `${nombreData.apellido}`;

  const nombreCompleto = `${nombreSesionActual} ${apellidoSesionActual}`;

  console.log(nombreCompleto)
  enviarNombre.textContent = nombreCompleto;
 
  items.forEach((item) => {
    const tooltipText = item.querySelector("a").getAttribute("data-tooltip");
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.innerText = tooltipText;
    item.appendChild(tooltip);
  });

  const logoutButton = document.querySelector('.salir');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      const confirmLogout = confirm('¿Estás seguro de cerrar sesión?');
      if (confirmLogout) {
        localStorage.removeItem('nombreData');
        window.location.href = '../../index.html'; // Redirige y reemplaza la entrada en el historial
        window.history.replaceState(null, '', '../../index.html');
      }
    });
  } else {
    console.error('No se encontró el botón de cerrar sesión');
  }



  if (storedAvatarUrl) {
    // Obtener el elemento de la imagen por su ID
    const imagenColaboradorElement = document.getElementById('imagenColaborador');

    // Establecer la URL de la imagen como el src
    imagenColaboradorElement.src = storedAvatarUrl;
    imagenColaboradorElement.alt = 'Avatar';
  } else {
    console.error('No se encontró la imagen del avatar');
  }
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
        text: '<i class="material-icons">file_download</i>',
        className: 'btn-verde',
      },

      {
        extend: 'pdfHtml5',
        text: '<i class="material-icons">picture_as_pdf</i>',
        className: 'btn-rojo',
        customize: function (doc) {
          doc.defaultStyle.fontSize = 10; // Ajusta el tamaño de la fuente en el PDF según sea necesario
        }
      },
      'print'
    ],
    columns: [
      {
        data: 'imagen_colaborador', title: 'Avatar', render: function (data) {
          return `<img src="${data}" class="avatar-img" alt="Avatar">`;
        }
      },
      { data: 'id_incidente', title: 'ID Incidente' },
      { data: 'nombre_colaborador', title: 'Nombre Colaborador' },
      { data: 'incidente_descrip', title: 'Descripción' },
      {
        data: 'estado', title: 'Estado', render: function (data) {
          return data === 2 ? 'Cerrado' : 'Pendiente';
        }
      },
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
    telefonoSeleccionado = data.telefono_colaborador
    descripSeleccionado = data.incidente_descrip

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
    const nombre = filaSeleccionada.querySelector('td:nth-child(3)').textContent;
    const id = filaSeleccionada.querySelector('td:nth-child(2)').textContent;
    const descripcion = filaSeleccionada.querySelector('td:nth-child(4)').textContent;

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

async function realizarIncidente(idIncidencia) {


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

      alert("Incidente realizado");


      const mensajes = [
        `✅ Tu incidencia: ${descripSeleccionado} ha sido resuelta. ¡Gracias por tu paciencia! 🎉`,
        `🌟 ¡Felicidades! Hemos solucionado tu incidencia: ${descripSeleccionado}. ¡Gracias por tu colaboración! 🚀`,
        `🎉 Buenas noticias: hemos resuelto tu incidencia "${descripSeleccionado}". ¡Gracias por tu comprensión! ✨`,
        `🚀 ¡Increíble! La incidencia "${descripSeleccionado}" ha sido cerrada con éxito. ¡Gracias por tu paciencia! 🌈`,
        `✅ ¡Operación completada! Hemos solucionado tu incidencia de TI: ${descripSeleccionado}. ¡Gracias por tu colaboración! 🛠️`,
        `🚀 Tu solicitud de asistencia técnica para "${descripSeleccionado}" ha sido resuelta con éxito. ¡Gracias por tu paciencia! 💻`,
        `🌐 ¡Excelentes noticias! La incidencia "${descripSeleccionado}" ha sido solucionada. ¡Gracias por tu comprensión! 🔧`,
        `💼 ¡Logro desbloqueado! Tu problema técnico con "${descripSeleccionado}" ha sido resuelto. ¡Gracias por tu paciencia! 🎮`

      ];

      const mensajeSeleccionado = mensajes[Math.floor(Math.random() * mensajes.length)];


      enviarMensajeTelegram(telefonoSeleccionado, mensajeSeleccionado);

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


  realizarIncidente(idIncidencia);
}
