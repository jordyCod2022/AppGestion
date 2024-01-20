const express = require('express');
const app = express();
const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');



const TelegramBot = require('node-telegram-bot-api');

dotenv.config();

const connectionTimeoutMillis = 40000;

// Configuración de Multer para almacenar las imágenes en la carpeta public/uploads


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
  console.log('Conexión a la base de datos cerrada debido a la terminación del proceso');
  process.exit(0);
});



// Configurar Express para servir archivos estáticos
app.use(cors());
app.use(express.json());
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

app.post('/getImagenColaborador', async (req, res) => {
  const idAsignacionUser = req.body.id_asignacion_user;


  console.log('Se recibió idAsignacionUser:', idAsignacionUser);

  try {
    // Consulta para obtener la imagen del colaborador
    const result = await pool.query(`
      SELECT
        imagen_colaborador
      FROM
        public.colaboradores
      WHERE
        id_colaborador = $1;
    `, [idAsignacionUser]);

    if (result.rows.length > 0) {
      const imagenColaborador = result.rows[0].imagen_colaborador;

      console.log('Imagen del colaborador:', imagenColaborador);

      res.json({ imagen_colaborador: imagenColaborador });
    } else {
      res.json({ imagen_colaborador: null });
    }
  } catch (error) {
    console.error('Error en la consulta a la base de datos:', error);
    res.status(500).json({ error: 'Error al obtener la imagen del colaborador' });
  }
});

app.get('/getTotalIncidentesSemana', async (req, res) => {
  const idAsignacionUser = req.query.id_asignacion_user;
  const fechaIncidencia = req.query.fecha_incidencia; // Asegúrate de enviar la fecha deseada desde el cliente

  try {
    const result = await pool.query(`
      SELECT
        TO_CHAR(fecha_incidente, 'Day') AS dia_semana,
        fecha_incidente::date AS fecha,
        COUNT(*) AS total_incidentes
      FROM
        public.incidente
      WHERE
        EXTRACT(ISODOW FROM fecha_incidente) BETWEEN 1 AND 5
        AND fecha_incidente >= date_trunc('week', CAST($2 AS DATE))::date
        AND fecha_incidente < date_trunc('week', CAST($2 AS DATE) + interval '1 week')::date
        AND id_asignacion_user = $1
      GROUP BY
        dia_semana, fecha
      ORDER BY
        fecha;
    `, [idAsignacionUser, fechaIncidencia]);

    if (result.rows.length > 0) {
      const totalIncidentesSemana = result.rows;
      console.log('Resultados de total de incidentes en la semana:', totalIncidentesSemana);
      res.json(totalIncidentesSemana);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error en la consulta a la base de datos:', error);
    res.status(500).json({ error: 'Error al obtener el total de incidentes en la semana' });
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
        i.id_reportacion_user,
        c.imagen_colaborador
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


app.post('/actualizarImagen', async (req, res) => {
  const idAsignacionUser = req.body.id_asignacion_user;
  const urlImagen = req.body.url_imagen; 
  console.log(idAsignacionUser);
  console.log(urlImagen);

  try {
    // Realizar la actualización en la base de datos
    const result = await pool.query(`
      UPDATE public.colaboradores
      SET imagen_colaborador = $1
      WHERE id_colaborador = $2;
    `, [urlImagen, idAsignacionUser]);

    // Verificar si se realizó la actualización correctamente
    if (result.rowCount > 0) {
      console.log(`Imagen del colaborador con idAsignacionUser ${idAsignacionUser} actualizada.`);
      res.json({ success: true });
    } else {
      console.log(`No se encontró el colaborador con idAsignacionUser ${idAsignacionUser}.`);
      res.status(404).json({ error: 'Colaborador no encontrado' });
    }
  } catch (error) {
    console.error('Error en la actualización de la imagen del colaborador:', error);
    res.status(500).json({ error: 'Error al actualizar la imagen del colaborador' });
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





app.get('/getIncidenciasGrafico', async (req, res) => {
  const idAsignacionUser = req.query.id_asignacion_user;
  const fechaIncidencia = req.query.fecha_incidencia; // Asegúrate de validar y formatear la fecha según tus necesidades

  try {
    // Consulta para obtener incidencias pendientes y cerradas con nombres de reportadores
    const result = await pool.query(`
      SELECT
        c_reportador.id_colaborador AS id_reportador,
        c_reportador.nombre_colaborador AS nombre_reportador,
        c_reportador.apellido_colaborador AS apellido_reportador,
        i.fecha_incidente,
        COUNT(i.id_incidente) AS total_incidentes
      FROM
        public.incidente i
      JOIN
        public.colaboradores c_reportador ON i.id_reportacion_user = c_reportador.id_colaborador
      WHERE
        i.id_asignacion_user = $1
        AND i.id_estado IN (2)
        AND i.fecha_incidente::date = $2::date
      GROUP BY
        c_reportador.id_colaborador, c_reportador.nombre_colaborador, c_reportador.apellido_colaborador, i.fecha_incidente
      ORDER BY
        i.fecha_incidente;
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


app.get('/getUltimosIncidentes', async (req, res) => {
  const fechaIncidencia = req.query.fecha_incidencia; 
  const idAsignacionUser = req.query.id_asignacion_user;

  console.log(fechaIncidencia, "id:", idAsignacionUser);

  try {
    const result = await pool.query(`
      SELECT 
        i.fecha_incidente,
        i.incidente_descrip,
        c.imagen_colaborador,
        c.nombre_colaborador AS nombre_reportador
      FROM 
        public.incidente i
      JOIN 
        public.colaboradores c ON i.id_reportacion_user = c.id_colaborador
      WHERE 
        DATE(i.fecha_incidente) = $1
        AND i.id_asignacion_user = $2
      ORDER BY
        i.fecha_incidente DESC
      LIMIT 4;
    `, [fechaIncidencia, idAsignacionUser]);

    if (result.rows.length > 0) {
      const ultimosIncidentes = result.rows;
      console.log('Resultados de los últimos incidentes:', ultimosIncidentes);
      res.json(ultimosIncidentes);
    } else {
      console.log('No se encontraron incidentes.');
      res.json([]);
    }
  } catch (error) {
    console.error('Error en la consulta a la base de datos:', error);
    res.status(500).json({ error: 'Error al obtener los últimos incidentes' });
  }
});

