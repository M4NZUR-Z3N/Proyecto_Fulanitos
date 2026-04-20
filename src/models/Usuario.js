const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombre: String,
    apellido: String,
    email: String,
    telefono: String,
    password: String,
    fechaRegistro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Usuarios', usuarioSchema);