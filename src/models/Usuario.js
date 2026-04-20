const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombre: String,
    apellido: String,
    email: String,
    telefono: String,
    password: String,
    confirmPassword: String
});

module.exports = mongoose.model('Usuarios', usuarioSchema);