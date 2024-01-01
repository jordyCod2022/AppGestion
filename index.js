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
  const indexPath = path.join(__dirname, 'login', 'login.html');
  res.sendFile(indexPath);
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
    } else {
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
