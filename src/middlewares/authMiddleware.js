// ============================================================
//  authMiddleware.js — Verifica el token JWT en rutas privadas
// ============================================================

const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  // El token llega en el header: Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      ok: false,
      mensaje: 'Acceso denegado. Se requiere token de autenticación.',
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // { id, email, rol }
    next();
  } catch (error) {
    return res.status(403).json({
      ok: false,
      mensaje: 'Token inválido o expirado.',
    });
  }
};

const soloAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({
      ok: false,
      mensaje: 'Acceso restringido. Se requieren permisos de administrador.',
    });
  }
  next();
};

module.exports = { verificarToken, soloAdmin };
