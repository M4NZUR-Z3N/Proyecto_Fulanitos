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
} = require('../controllers/usuariosController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

// Rutas públicas
router.post('/registro', registrar);
router.post('/login', login);

// Rutas protegidas
router.get('/perfil', verificarToken, obtenerPerfil);
router.get('/', verificarToken, soloAdmin, obtenerUsuarios);

module.exports = router;
