const Orden = require('../models/orden');
const Usuario = require('../models/usuario');

const crearOrden = async (req, res) => {
  try {
    const { items, metodoPago, subtotal, envio, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ ok: false, mensaje: 'El carrito está vacío.' });
    }

    const nuevaOrden = new Orden({
      usuarioId: req.usuario.id,
      items,
      metodoPago,
      subtotal,
      envio,
      total,
      estado: 'completado'
    });

    await nuevaOrden.save();

    // Vaciamos el carrito del usuario tras realizar el pago
    await Usuario.findByIdAndUpdate(req.usuario.id, { $set: { carrito: [] } });

    res.status(201).json({
      ok: true,
      mensaje: '¡Pago exitoso y orden registrada!',
      orden: nuevaOrden,
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al crear la orden.', error: error.message });
  }
};

const obtenerMisOrdenes = async (req, res) => {
  try {
    const misOrdenes = await Orden.find({ usuarioId: req.usuario.id }).sort({ fechaCreacion: -1 });

    res.status(200).json({
      ok: true,
      total: misOrdenes.length,
      ordenes: misOrdenes,
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener las órdenes.', error: error.message });
  }
};

const obtenerOrdenPorId = async (req, res) => {
  try {
    const orden = await Orden.findById(req.params.id);

    if (!orden) {
      return res.status(404).json({ ok: false, mensaje: 'Orden no encontrada.' });
    }

    // Seguridad: el usuario solo puede ver sus órdenes (a menos que sea admin)
    if (orden.usuarioId.toString() !== req.usuario.id && req.usuario.rol !== 'admin') {
      return res.status(403).json({ ok: false, mensaje: 'No tienes permiso para ver esta orden.' });
    }

    res.status(200).json({ ok: true, orden });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener la orden.', error: error.message });
  }
};

const obtenerTodasLasOrdenes = async (req, res) => {
  try {
    const ordenes = await Orden.find().sort({ fechaCreacion: -1 });
    res.status(200).json({
      ok: true,
      total: ordenes.length,
      ordenes,
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener las órdenes.', error: error.message });
  }
};

const actualizarEstadoOrden = async (req, res) => {
  try {
    const { estado } = req.body;
    const estadosValidos = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado', 'completado'];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        ok: false,
        mensaje: `Estado inválido. Opciones: ${estadosValidos.join(', ')}.`,
      });
    }

    const orden = await Orden.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );

    if (!orden) {
      return res.status(404).json({ ok: false, mensaje: 'Orden no encontrada.' });
    }

    res.status(200).json({ ok: true, mensaje: 'Estado actualizado.', orden });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar el estado.', error: error.message });
  }
};

module.exports = {
  crearOrden,
  obtenerMisOrdenes,
  obtenerOrdenPorId,
  obtenerTodasLasOrdenes,
  actualizarEstadoOrden,
};
