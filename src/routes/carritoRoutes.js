const express = require('express');
const router = express.Router();
const { agregarCarrito, obtenerCarrito, vaciarCarrito } = require('../controllers/carritoController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, obtenerCarrito);
router.post('/agregar', verificarToken, agregarCarrito);
router.delete('/vaciar', verificarToken, vaciarCarrito);

module.exports = router;
