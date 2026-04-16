// ============================================================
//  app.js — Servidor principal de Side B API
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const productosRoutes = require('./routes/productosRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const ordenesRoutes  = require('./routes/ordenesRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares globales ──────────────────────────────────
app.use(cors());                        // Permite peticiones del frontend
app.use(express.json());                // Parsea body JSON
app.use(express.urlencoded({ extended: true })); // Parsea form-data

// ── Health check ─────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    mensaje: '🎵 Side B API funcionando correctamente.',
    version: '1.0.0',
    endpoints: {
      productos: '/api/productos',
      usuarios:  '/api/usuarios',
      ordenes:   '/api/ordenes',
    },
  });
});

// ── Rutas API ─────────────────────────────────────────────
app.use('/api/productos', productosRoutes);
app.use('/api/usuarios',  usuariosRoutes);
app.use('/api/ordenes',   ordenesRoutes);

// ── Manejo de errores ─────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Iniciar servidor ──────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎵  Side B API corriendo en http://localhost:${PORT}`);
  console.log(`📦  Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\nEndpoints disponibles:`);
  console.log(`   GET    http://localhost:${PORT}/`);
  console.log(`   GET    http://localhost:${PORT}/api/productos`);
  console.log(`   POST   http://localhost:${PORT}/api/usuarios/registro`);
  console.log(`   POST   http://localhost:${PORT}/api/usuarios/login`);
  console.log(`   POST   http://localhost:${PORT}/api/ordenes\n`);
});

module.exports = app;
