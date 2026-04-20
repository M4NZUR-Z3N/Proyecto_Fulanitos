const mongoose = require('mongoose');

const ordenSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuarios' },
    items: [{
        productoId: String,
        titulo: String,
        artista: String,
        cover: String,
        precioUnitario: Number,
        cantidad: Number,
        subtotal: Number
    }],
    metodoPago: { type: String, default: 'simulado' },
    subtotal: Number,
    envio: Number,
    total: Number,
    estado: { type: String, default: 'completado' },
    fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ordenes', ordenSchema);
