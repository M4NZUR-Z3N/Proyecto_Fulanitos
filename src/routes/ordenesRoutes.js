// ============================================================
//  ordenesRoutes.js
// ============================================================

const express = require('express');
const router = express.Router();
const {
  crearOrden,
  obtenerMisOrdenes,
  obtenerOrdenPorId,
  obtenerTodasLasOrdenes,
  actualizarEstadoOrden,
  cancelarOrden
} = require('../controllers/ordenesController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(verificarToken);

router.post('/', crearOrden);
router.get('/mis-ordenes', obtenerMisOrdenes);
router.get('/:id', obtenerOrdenPorId);
router.patch('/:id/cancelar', cancelarOrden);

// Solo admin
router.get('/', soloAdmin, obtenerTodasLasOrdenes);
router.patch('/:id/estado', soloAdmin, actualizarEstadoOrden);

module.exports = router;
