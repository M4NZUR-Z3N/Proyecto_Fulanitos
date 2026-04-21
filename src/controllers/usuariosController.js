// ============================================================
//  usuariosController.js — Registro, login y perfil
// ============================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // aqui se tiene que poner la base de datos 
const Usuario = require('../models/usuario');

// POST /api/usuarios/registro
const registrar = async (req, res) => {
  try {
    const { nombre, apellido, email, password, confirmarPassword, telefono } = req.body;

    // --- Validaciones ---
    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Los campos nombre, apellido, email y contraseña son obligatorios.',
      });
    }

    if (password !== confirmarPassword) {
      return res.status(400).json({ ok: false, mensaje: 'Las contraseñas no coinciden.' });
    }

    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La contraseña debe tener al menos 6 caracteres.',
      });
    }

    // Verifica si el email ya existe
    const existe = await Usuario.findOne({ email: email.toLowerCase() });
    if (existe) {
      return res.status(409).json({ ok: false, mensaje: 'El correo electrónico ya está registrado.' });
    }

    // Hashea la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    const nuevoUsuario = new Usuario({
      nombre,
      apellido,
      email: email.toLowerCase(),
      password: passwordHash,
      telefono: telefono || null,
      fechaRegistro: new Date().toISOString()
    });

    await nuevoUsuario.save();
    console.log(`✅ Nuevo usuario registrado en DB: ${email}`);

    // No devolver el password en la respuesta
    const { password: _, ...usuarioPublico } = nuevoUsuario.toObject();

    res.status(201).json({
      ok: true,
      mensaje: '¡Usuario registrado exitosamente!',
      usuario: usuarioPublico,
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al registrar el usuario.', error: error.message });
  }
};

// POST /api/usuarios/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, mensaje: 'Email y contraseña son requeridos.' });
    }

    // Busca el usuario
    const usuario = await Usuario.findOne({ email: email.toLowerCase() });
    if (!usuario) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas.' });
    }

    // Compara contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas.' });
    }

    // Genera token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { password: _, ...usuarioPublico } = usuario.toObject();

    res.status(200).json({
      ok: true,
      mensaje: 'Inicio de sesión exitoso.',
      token,
      usuario: usuarioPublico,
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al iniciar sesión.', error: error.message });
  }
};

// GET /api/usuarios/perfil  (requiere token)
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });
    }

    const { password: _, ...usuarioPublico } = usuario.toObject();

    res.status(200).json({ ok: true, usuario: usuarioPublico });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener perfil.', error: error.message });
  }
};

// GET /api/usuarios  (solo admin)
const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    const lista = usuarios.map(u => {
      const { password: _, ...resto } = u.toObject();
      return resto;
    });
    res.status(200).json({ ok: true, total: lista.length, usuarios: lista });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener usuarios.', error: error.message });
  }
};

const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, apellido, telefono } = req.body;
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.usuario.id,
      { nombre, apellido, telefono },
      { new: true }
    );
    
    if (!usuarioActualizado) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });
    }
    
    res.status(200).json({ ok: true, mensaje: 'Perfil actualizado exitosamente.', usuario: usuarioActualizado });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar el perfil.', error: error.message });
  }
};

const eliminarCuenta = async (req, res) => {
  try {
    const { id } = req.usuario;
    
    // Eliminar base del usuario
    await Usuario.findByIdAndDelete(id);

    // Como extra sano: borrar todas sus ordenes también (o se puede dejar para auditoria)
    const Orden = require('../models/orden');
    await Orden.deleteMany({ usuarioId: id });

    res.status(200).json({ ok: true, mensaje: 'Cuenta eliminada para siempre.' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar cuenta.', error: error.message });
  }
};

module.exports = { registrar, login, obtenerPerfil, obtenerUsuarios, actualizarPerfil, eliminarCuenta };
