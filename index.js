const express = require('express');
const app = express();
const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

const TelegramBot = require('node-telegram-bot-api');

dotenv.config();

const connectionTimeoutMillis = 40000;
const telegramToken = '6777426387:AAHvHB1oJdcMqt6hutj2D1ZqcI7y0a2dFBg';
const bot = new TelegramBot(telegramToken, { polling: false });
// Configuración para el pool de conexiones a PostgreSQL
const pool = new Pool({
  connectionString: process.env.conexion,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: connectionTimeoutMillis,
});

// Manejar eventos de conexión y desconexión de la base de datos
pool.on('connect', () => {
  console.log('Conexión a la base de datos establecida con éxito.');
});

pool.on('error', (err) => {
  console.error('Error en la conexión a la base de datos:', err);
});

process.on('SIGINT', () => {
  pool.end();
  console.log('Conexión a la base de datos cerrada debido a la terminación del proceso.');
  process.exit(0);
});

// Configurar Express para servir archivos estáticos
app.use(express.static('public'));
app.use(bodyParser.json());  // Necesitas agregar este middleware para manejar el cuerpo de la solicitud JSON

// Ruta para la página principal
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  res.sendFile(indexPath);
});

app.get('/getNombre', async (req, res) => {
  // Obtener la cédula del usuario autenticado desde la solicitud
  const cedula = req.query.username; // Cambiado de req.body a req.query

  try {
    // Realizar la consulta a la base de datos para obtener el nombre y el id_colaborador
    const result = await pool.query(`
      SELECT id_colaborador, nombre_colaborador
      FROM public.colaboradores
      WHERE cedula = $1
    `, [cedula]);

    if (result.rows.length > 0) {
      const idColaborador = result.rows[0].id_colaborador;
      const nombre = result.rows[0].nombre_colaborador;

      // Imprimir los resultados en la consola del servidor
      console.log('ID del usuario:', idColaborador);
      console.log('Nombre del usuario:', nombre);
      console.log('Nombre de usuario (cedula):', cedula);

      res.json({ id_colaborador: idColaborador, nombre: nombre, username: cedula });
    } else {
      res.json({ id_colaborador: null, nombre: null, username: null });
    }
  } catch (error) {
    console.error('Error en la consulta a la base de datos:', error);
    res.status(500).json({ error: 'Error al obtener el nombre e ID del usuario' });
  }
});


//obtener ttickts pendientes y resueltos:
app.get('/getTotalesIncidencias', async (req, res) => {
  const idAsignacionUser = req.query.id_asignacion_user;
  const fechaIncidencia = req.query.fecha_incidencia; // Asegúrate de validar y formatear la fecha según tus necesidades

  try {
    const result = await pool.query(`
      SELECT
        id_asignacion_user,
        COUNT(*) FILTER (WHERE id_estado = 2) AS total_pendientes,
        COUNT(*) FILTER (WHERE id_estado = 3) AS total_cerrados
      FROM
        public.incidente
      WHERE
        id_asignacion_user = $1
        AND fecha_incidente::date = $2::date
      GROUP BY
        id_asignacion_user;
    `, [idAsignacionUser, fechaIncidencia]);

    if (result.rows.length > 0) {
      const { id_asignacion_user, total_pendientes, total_cerrados } = result.rows[0];
      
      console.log('Resultados de incidencias:', { id_asignacion_user, total_pendientes, total_cerrados });

      res.json({ 
        id_asignacion_user,
        total_pendientes,
        total_cerrados
      });
    } else {
      res.json({ 
        id_asignacion_user: null,
        total_pendientes: null,
        total_cerrados: null
      });
    }
  } catch (error) {
    console.error('Error en la consulta a la base de datos:', error);
    res.status(500).json({ error: 'Error al obtener los totales de incidencias' });
  }
});


app.get('/getIncidencias', async (req, res) => {
  const idAsignacionUser = req.query.id_asignacion_user;
  const fechaIncidencia = req.query.fecha_incidencia; // Asegúrate de validar y formatear la fecha según tus necesidades

  try {
    // Consulta para obtener incidencias pendientes y cerradas
    const result = await pool.query(`
      SELECT
        i.id_incidente,
        i.incidente_nombre,
        i.incidente_descrip,
        i.fecha_incidente,
        c.nombre_colaborador,
        c.apellido_colaborador,
        c.telefono_colaborador,
        i.id_estado,
        i.id_reportacion_user
      FROM
        public.incidente i
      JOIN
        public.colaboradores c ON i.id_reportacion_user = c.id_colaborador
      WHERE
        i.id_asignacion_user = $1
        AND i.id_estado IN (2)
        AND i.fecha_incidente::date = $2::date;
    `, [idAsignacionUser, fechaIncidencia]);

    if (result.rows.length > 0) {
      const incidencias = result.rows;
      
      console.log('Resultados de incidencias:', incidencias);

      res.json(incidencias);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error en la consulta a la base de datos:', error);
    res.status(500).json({ error: 'Error al obtener las incidencias' });
  }
});

// Ruta para el inicio de sesión
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  console.log('Cédula recibida:', username);
  console.log('Contraseña recibida:', password);

  try {
    // Realizar la consulta a la base de datos para verificar las credenciales
    const result = await pool.query(`
      SELECT t.token
      FROM public.httptoken AS t
      JOIN public.colaboradores AS c ON t.id_colaboradorfk = c.id_colaborador
      WHERE c.cedula = $1 AND t.token = $2
    `, [username, password]);

    if (result.rows.length > 0) {
      console.log('Inicio de sesión exitoso');
      res.json({ authenticated: true });
    } 
    
    else {
      console.log('Inicio de sesión fallido');
      res.json({ authenticated: false });
    }
  } catch (error) {
    console.error('Error en la consulta a la base de datos:', error);
    res.status(500).json({ error: 'Error en la autenticación' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});



async function enviarMensajeTelegram(telefonoColaborador, mensajeTelegram) {
  try {
    const chatId = telefonoColaborador;
    console.log("Teléfono:", telefonoColaborador);
    console.log("Mensaje:", mensajeTelegram);
    // Enviar mensaje a Telegram
    await bot.sendMessage(chatId, mensajeTelegram);
  } catch (error) {
    console.error('ERROR al enviar mensaje a Telegram', error);
    throw error;
  }
}

// Ruta para enviar mensajes a través de Telegram
app.post('/enviarMensajeTelegram', async (req, res) => {
  const { telefono_colaborador, mensajeTelegram } = req.body;

  try {
    console.log("Recibiendo telefono:", telefono_colaborador);
    console.log("Recibiendo mensaje:", mensajeTelegram);
    // Llama a la función para enviar el mensaje a Telegram
    await enviarMensajeTelegram(telefono_colaborador, mensajeTelegram);

    // Respuesta exitosa
    res.json({ success: true });
  } catch (error) {
    console.error('Error al enviar mensaje a Telegram:', error);
    res.status(500).json({ error: 'Error al enviar mensaje a Telegram' });
  }
});

// Ruta para actualizar el estado de la incidencia a "Cerrado"
app.post('/cerrarIncidencia', async (req, res) => {
  const idIncidencia = req.body.id_incidencia; // Asegúrate de pasar el ID correcto desde el cliente

  try {
    // Realizar la consulta de actualización en la base de datos
    await pool.query(`
      UPDATE public.incidente
      SET id_estado = 3
      WHERE id_incidente = $1;
    `, [idIncidencia]);

    console.log(`Incidencia ${idIncidencia} actualizada a estado "Cerrado"`);

    // Respuesta exitosa
    res.json({ success: true });
  } catch (error) {
    console.error('Error en la actualización de la incidencia:', error);
    res.status(500).json({ error: 'Error al actualizar la incidencia' });
  }
});
