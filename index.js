const express = require('express');
const app = express();
const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();

const connectionTimeoutMillis = 40000;

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
  const idReportacionUser = req.query.id_reportacion_user;

  try {
    const result = await pool.query(`
      SELECT
        id_reportacion_user,
        COUNT(*) FILTER (WHERE id_estado = 2) AS total_pendientes,
        COUNT(*) FILTER (WHERE id_estado = 3) AS total_cerrados
      FROM
        public.incidente
      WHERE
        id_reportacion_user = $1
      GROUP BY
        id_reportacion_user;
    `, [idReportacionUser]);

    if (result.rows.length > 0) {
      const { id_reportacion_user, total_pendientes, total_cerrados } = result.rows[0];
      
      console.log('Resultados de incidencias:', { id_reportacion_user, total_pendientes, total_cerrados });

      res.json({ 
        id_reportacion_user,
        total_pendientes,
        total_cerrados
      });
    } else {
      res.json({ 
        id_reportacion_user: null,
        total_pendientes: null,
        total_cerrados: null
      });
    }
  } catch (error) {
    console.error('Error en la consulta a la base de datos:', error);
    res.status(500).json({ error: 'Error al obtener los totales de incidencias' });
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
