const TelegramBot = require('node-telegram-bot-api');


const telegramToken = '6777426387:AAHvHB1oJdcMqt6hutj2D1ZqcI7y0a2dFBg';
const bot = new TelegramBot(telegramToken, { polling: false });

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
      const botonInformar = document.createElement("button");
      botonInformar.textContent = "Informar";
      botonInformar.onclick = function () {
        informarIncidente(incidencia.id_incidente, incidencia.telefono_colaborador);
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
// Función para simular acción al informar incidente
function informarIncidente(id, telefonoColaborador) {
  alert(`Informando incidente con ID ${id}`);
  enviarMensajeTelegram(telefonoColaborador);
}

// Función para simular acción al marcar incidente como realizado
function realizarIncidente(id) {
  alert(`Marcando incidente con ID ${id} como realizado`);
}


async function enviarMensajeTelegram(telefonoColaborador) {
  try {
    const chatId = telefonoColaborador;
    const mensajeTelegram = `🚨 Nuevo incidente reportado 🚨\n\n‼️ Título: ${nombreTituloGlobal}\n📄 Descripción: ${descripcionInciGlobal}\n\n👤 Información del Colaborador:\n👉 Nombre: ${infoColaborador.nombre_colaborador}\n👉 Apellido: ${infoColaborador.apellido_colaborador}\n🏢 Departamento:${infoColaborador.nombre_departamento}\n📞 Teléfono: ${telefonoColaborador}`;

    // Enviar mensaje a Telegram
    await bot.sendMessage(chatId, mensajeTelegram);
  } catch (error) {
    console.error('ERROR al enviar mensaje a Telegram', error);
  }
}
