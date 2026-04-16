// ============================================================
//  ordenesController.js — Crear y consultar órdenes de compra
// ============================================================

const db = require('../config/db'); // aqui se tiene que poner la base de datos 

// POST /api/ordenes  (usuario autenticado)
const crearOrden = (req, res) => {
  try {
    const { items, metodoPago } = req.body;
   

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, mensaje: 'La orden debe tener al menos un producto.' });
    }

    if (!metodoPago) {
      return res.status(400).json({ ok: false, mensaje: 'Debe especificar un método de pago.' });
    }

    const metodosValidos = ['tarjeta', 'paypal'];
    if (!metodosValidos.includes(metodoPago)) {
      return res.status(400).json({
        ok: false,
        mensaje: `Método de pago inválido. Use: ${metodosValidos.join(', ')}.`,
      });
    }

    // Construye los items validando stock
    const itemsOrden = [];
    const erroresStock = [];

    for (const item of items) {
      const producto = db.productos.find((p) => p.id === Number(item.productoId));

      if (!producto) {
        erroresStock.push(`Producto con ID ${item.productoId} no existe.`);
        continue;
      }

      if (producto.stock < item.cantidad) {
        erroresStock.push(
          `Stock insuficiente para "${producto.titulo}". Disponible: ${producto.stock}, solicitado: ${item.cantidad}.`
        );
        continue;
      }

      itemsOrden.push({
        productoId: producto.id,
        titulo: producto.titulo,
        artista: producto.artista,
        precioUnitario: producto.precio,
        cantidad: Number(item.cantidad),
        subtotal: producto.precio * Number(item.cantidad),
      });
    }

    if (erroresStock.length > 0) {
      return res.status(400).json({ ok: false, mensaje: 'Errores en la orden.', errores: erroresStock });
    }

    // Calcula totales
    const subtotal = itemsOrden.reduce((acc, i) => acc + i.subtotal, 0);
    const envio = 5; // tarifa fija
    const total = subtotal + envio;

    const nuevaOrden = {
      id: db.getNextOrdenId(),
      usuarioId: req.usuario.id,
      items: itemsOrden,
      metodoPago,
      subtotal,
      envio,
      total,
      estado: 'pendiente', // pendiente | procesando | enviado | entregado | cancelado
      fechaCreacion: new Date().toISOString(),
    };

    // Descuenta stock
    itemsOrden.forEach((item) => {
      const prod = db.productos.find((p) => p.id === item.productoId);
      prod.stock -= item.cantidad;
    });

    db.ordenes.push(nuevaOrden);

    res.status(201).json({
      ok: true,
      mensaje: '¡Orden creada exitosamente!',
      orden: nuevaOrden,
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al crear la orden.', error: error.message });
  }
};

// GET /api/ordenes/mis-ordenes  (usuario autenticado — solo sus órdenes)
const obtenerMisOrdenes = (req, res) => {
  try {
    const misOrdenes = db.ordenes.filter((o) => o.usuarioId === req.usuario.id);

    res.status(200).json({
      ok: true,
      total: misOrdenes.length,
      ordenes: misOrdenes,
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener las órdenes.', error: error.message });
  }
};

// GET /api/ordenes/:id  (usuario autenticado)
const obtenerOrdenPorId = (req, res) => {
  try {
    const orden = db.ordenes.find((o) => o.id === Number(req.params.id));

    if (!orden) {
      return res.status(404).json({ ok: false, mensaje: 'Orden no encontrada.' });
    }

    // El usuario solo puede ver sus propias órdenes (admin puede ver todas)
    if (orden.usuarioId !== req.usuario.id && req.usuario.rol !== 'admin') {
      return res.status(403).json({ ok: false, mensaje: 'No tienes permiso para ver esta orden.' });
    }

    res.status(200).json({ ok: true, orden });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener la orden.', error: error.message });
  }
};

// GET /api/ordenes  (solo admin — todas las órdenes)
const obtenerTodasLasOrdenes = (req, res) => {
  try {
    res.status(200).json({
      ok: true,
      total: db.ordenes.length,
      ordenes: db.ordenes,
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener las órdenes.', error: error.message });
  }
};

// PATCH /api/ordenes/:id/estado  (solo admin)
const actualizarEstadoOrden = (req, res) => {
  try {
    const { estado } = req.body;
    const estadosValidos = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        ok: false,
        mensaje: `Estado inválido. Opciones: ${estadosValidos.join(', ')}.`,
      });
    }

    const orden = db.ordenes.find((o) => o.id === Number(req.params.id));
    if (!orden) {
      return res.status(404).json({ ok: false, mensaje: 'Orden no encontrada.' });
    }

    orden.estado = estado;

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
