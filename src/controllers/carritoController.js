const Usuario = require('../models/usuario');

const agregarCarrito = async (req, res) => {
    try {
        const { productoId, cantidad } = req.body;
        const usuario = await Usuario.findById(req.usuario.id);

        if (!usuario) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });

        // Si ya existe el producto, solo suma su cantidad
        const itemIndex = usuario.carrito.findIndex(item => item.productoId === String(productoId));
        if (itemIndex > -1) {
            usuario.carrito[itemIndex].cantidad += cantidad;
        } else {
            usuario.carrito.push({ productoId: String(productoId), cantidad });
        }
        
        await usuario.save();
        res.status(200).json({ ok: true, mensaje: 'Producto añadido al carrito', carrito: usuario.carrito });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al actualizar carrito', error: error.message });
    }
};

const vaciarCarrito = async (req, res) => {
    try {
        await Usuario.findByIdAndUpdate(req.usuario.id, { $set: { carrito: [] } });
        res.status(200).json({ ok: true, mensaje: 'Carrito vaciado exitosamente.' });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al vaciar carrito', error: error.message });
    }
};

const obtenerCarrito = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id);
        if (!usuario) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
        
        res.status(200).json({ ok: true, carrito: usuario.carrito });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener carrito', error: error.message });
    }
};

module.exports = { agregarCarrito, obtenerCarrito, vaciarCarrito };
