

const express = require("express");
const app = express();
const path = require("path");  // Necesitamos el módulo 'path' para trabajar con rutas de archivos
const { Pool } = require('pg');
const dotenv = require('dotenv');

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

// Ruta para la página principal
app.get("/", (req, res) => {
  // Usamos path.join para obtener la ruta completa del archivo index.html
  const indexPath = path.join(__dirname, 'public', 'index.html');
  res.sendFile(indexPath);
});

const PORT = 3000;

const server = app.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});
