const express = require('express');
const router = express.Router();
const { agregarCarrito, obtenerCarrito } = require('../controllers/carritoController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, obtenerCarrito);
router.post('/agregar', verificarToken, agregarCarrito);

module.exports = router;
