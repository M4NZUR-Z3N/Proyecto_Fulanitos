// Configuración principal del servidor Side B
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const app = express();

// Variables de entorno
dotenv.config();

// Configuración de vistas (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Carpeta de archivos estáticos
app.use(express.static(path.join(__dirname, '..', 'public')));

// Middlewares obligatorios
app.use(express.json()); // Entender datos en formato JSON
app.use(morgan('dev')); // Ver logs de las peticiones
app.use(express.urlencoded({ extended: true })); // Entender datos de formularios

// Conexión a la base de datos
const conectarDB = require('./config/db');
conectarDB();

// Rutas de la API
const usuariosRoutes = require('./routes/usuariosRoutes');
const carritoRoutes = require('./routes/carritoRoutes');
const ordenesRoutes = require('./routes/ordenesRoutes');

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/ordenes', ordenesRoutes);

// Vistas del sitio (Frontend)
app.get('/', (req, res) => res.render('index'));
app.get('/registro', (req, res) => res.render('registro'));
app.get('/sesion', (req, res) => res.render('sesion'));
app.get('/catalogo', (req, res) => res.render('catalogo'));
app.get('/carrito', (req, res) => res.render('carrito'));
app.get('/perfil', (req, res) => res.render('perfil'));
app.get('/landing', (req, res) => res.render('landing-page'));

// Encender el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n Side B sonando en http://localhost:${PORT}\n`);
});

module.exports = app;
