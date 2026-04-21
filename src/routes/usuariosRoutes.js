// ============================================================
//  usuariosRoutes.js
// ============================================================

const express = require('express');
const router = express.Router();
const {
  registrar,
  login,
  obtenerPerfil,
  obtenerUsuarios,
  actualizarPerfil,
  eliminarCuenta
} = require('../controllers/usuariosController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

// Rutas públicas
router.post('/registro', registrar);
router.post('/login', login);

// Rutas protegidas
router.get('/perfil', verificarToken, obtenerPerfil);
router.put('/perfil', verificarToken, actualizarPerfil);
router.delete('/perfil', verificarToken, eliminarCuenta);
router.get('/', verificarToken, soloAdmin, obtenerUsuarios);

module.exports = router;
