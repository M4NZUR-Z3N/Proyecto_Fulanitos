// ============================================================
//  index.js — Servidor principal de Side B
// ============================================================

const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const app = express();

//Cargar variables
dotenv.config();

// Motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Archivos estáticos (css, js, assets)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Middlewares globales
app.use(express.json()); //Para que el servidor entienda JSON

app.use(morgan('dev')); //Para ver las peticiones en consola

app.use(express.urlencoded({ extended: true })); //Para que el servidor entienda formularios

//Importamos la funcion que conecta la DB
const conectarDB = require('./config/db');

//Conectamos a la DB
conectarDB();

//Importamos las rutas
const usuariosRoutes = require('./routes/usuariosRoutes');

//Rutas
app.use('/api/usuarios', usuariosRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.render('index');
});

// Ruta registro
app.get('/registro', (req, res) => {
  res.render('registro');
});

// Ruta login
app.get('/sesion', (req, res) => {
  res.render('sesion');
});

// Ruta catalogo
app.get('/catalogo', (req, res) => {
  res.render('catalogo');
});

// Ruta carrito
app.get('/carrito', (req, res) => {
  res.render('carrito');
});

// Ruta done
app.get('/done', (req, res) => {
  res.render('done');
});

// Ruta landing page
app.get('/landing', (req, res) => {
  res.render('landing-page');
});

// Iniciar servidor
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`\n🎵  Side B corriendo en http://localhost:${PORT}\n`);
});

module.exports = app;
