// ============================================================
//  productosController.js — Lógica de negocio para productos
// ============================================================

const db = require('../config/db'); // aqui se tiene que poner la base de datos 

// GET /api/productos
// Devuelve todos los productos. Soporta filtros: ?genero=Jazz&artista=Miles
const obtenerProductos = (req, res) => {
  try {
    let resultado = [...db.productos];

    // Filtro por género
    if (req.query.genero) {
      resultado = resultado.filter(
        (p) => p.genero.toLowerCase() === req.query.genero.toLowerCase()
      );
    }

    // Filtro por artista (búsqueda parcial)
    if (req.query.artista) {
      resultado = resultado.filter((p) =>
        p.artista.toLowerCase().includes(req.query.artista.toLowerCase())
      );
    }

    // Filtro por precio máximo
    if (req.query.precioMax) {
      resultado = resultado.filter((p) => p.precio <= Number(req.query.precioMax));
    }

    res.status(200).json({
      ok: true,
      total: resultado.length,
      productos: resultado,
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener productos.', error: error.message });
  }
};

// GET /api/productos/:id
const obtenerProductoPorId = (req, res) => {
  try {
    const producto = db.productos.find((p) => p.id === Number(req.params.id));

    if (!producto) {
      return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado.' });
    }

    res.status(200).json({ ok: true, producto });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener el producto.', error: error.message });
  }
};

// POST /api/productos  (solo admin)
const crearProducto = (req, res) => {
  try {
    const { titulo, artista, genero, anio, precio, stock, edicion, tamanio, velocidad } = req.body;

    // Validaciones básicas
    if (!titulo || !artista || !precio) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Los campos título, artista y precio son obligatorios.',
      });
    }

    const nuevoProducto = {
      id: db.productos.length + 1,
      titulo,
      artista,
      genero: genero || 'Sin género',
      anio: anio || null,
      formato: 'Vinilo',
      edicion: edicion || 'Estándar',
      tamanio: tamanio || '12 pulgadas',
      velocidad: velocidad || '33 RPM',
      precio: Number(precio),
      stock: Number(stock) || 0,
      imagen: 'vinilo-base.webp',
      badge: null,
    };

    db.productos.push(nuevoProducto);

    res.status(201).json({
      ok: true,
      mensaje: 'Producto creado exitosamente.',
      producto: nuevoProducto,
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al crear el producto.', error: error.message });
  }
};

// PUT /api/productos/:id  (solo admin)
const actualizarProducto = (req, res) => {
  try {
    const index = db.productos.findIndex((p) => p.id === Number(req.params.id));

    if (index === -1) {
      return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado.' });
    }

    // Mergea solo los campos enviados
    db.productos[index] = { ...db.productos[index], ...req.body };

    res.status(200).json({
      ok: true,
      mensaje: 'Producto actualizado.',
      producto: db.productos[index],
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar el producto.', error: error.message });
  }
};

// DELETE /api/productos/:id  (solo admin)
const eliminarProducto = (req, res) => {
  try {
    const index = db.productos.findIndex((p) => p.id === Number(req.params.id));

    if (index === -1) {
      return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado.' });
    }

    const eliminado = db.productos.splice(index, 1)[0];

    res.status(200).json({
      ok: true,
      mensaje: 'Producto eliminado.',
      producto: eliminado,
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar el producto.', error: error.message });
  }
};

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};
