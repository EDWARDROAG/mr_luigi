const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { logger } = require('../utils/logger');
const { sendRecoveryEmail } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_ADMIN = process.env.JWT_EXPIRES_ADMIN || process.env.JWT_EXPIRE || '8h';
const JWT_EXPIRES_CAJERO = process.env.JWT_EXPIRES_CAJERO || '2h';
const SALT_ROUNDS = 10;

const buildToken = (user) => {
  const expiresIn = user.role === 'admin' ? JWT_EXPIRES_ADMIN : JWT_EXPIRES_CAJERO;
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      nombre: user.nombre,
    },
    JWT_SECRET,
    { expiresIn }
  );
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos',
      });
    }

    const user = await User.findByEmail(email);

    if (!user) {
      logger.warn(`Intento de login fallido - email no existe: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    const isPasswordValid = await User.verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      logger.warn(`Intento de login fallido - contraseña incorrecta: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    const token = buildToken(user);
    logger.info(`Login exitoso: ${email} (${user.role})`);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error(`Error en login: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

const register = async (req, res) => {
  try {
    const { nombre, email, password, role = 'cajero' } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y contraseña son requeridos',
      });
    }

    if (role !== 'cajero') {
      return res.status(403).json({
        success: false,
        message: 'Solo se pueden crear usuarios con rol de cajero',
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado',
      });
    }

    const newUser = await User.create({ nombre, email, password, role });
    logger.info(`Nuevo usuario registrado: ${email} por ${req.user?.email || 'admin'}`);

    return res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: {
        id: newUser.id,
        nombre: newUser.nombre,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    logger.error(`Error en register: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

const verify = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ valid: false, message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ valid: false, message: 'Usuario no encontrado' });
    }

    return res.json({
      valid: true,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(401).json({ valid: false, message: 'Token inválido o expirado' });
  }
};

const logout = async (req, res) => {
  try {
    if (req.user?.id) {
      logger.info(`Logout usuario ID: ${req.user.id}`);
    }
    return res.json({
      success: true,
      message: 'Sesión cerrada exitosamente',
    });
  } catch (error) {
    logger.error(`Error en logout: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const oldToken = req.headers.authorization?.split(' ')[1];

    if (!oldToken) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(oldToken, JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        decoded = jwt.decode(oldToken);
      } else {
        return res.status(401).json({
          success: false,
          message: 'Token inválido',
        });
      }
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no existe',
      });
    }

    const newToken = buildToken(user);
    logger.info(`Token renovado para usuario: ${user.email}`);

    return res.json({
      success: true,
      token: newToken,
    });
  } catch (error) {
    logger.error(`Error en refreshToken: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual y nueva son requeridas',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres',
      });
    }

    const user = await User.findByEmail(req.user.email);
    const isValid = await User.verifyPassword(currentPassword, user.password_hash);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta',
      });
    }

    await User.update(userId, { password: newPassword });
    logger.info(`Contraseña cambiada para usuario: ${user.email}`);

    return res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (error) {
    logger.error(`Error en changePassword: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email es requerido',
      });
    }

    const user = await User.findByEmail(email);

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      await sendRecoveryEmail(user.email, resetToken);
      logger.info(`Enlace de recuperación solicitado para: ${email}`);
    }

    return res.json({
      success: true,
      message: 'Si el email existe, recibirás un enlace de recuperación',
    });
  } catch (error) {
    logger.error(`Error en forgotPassword: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    return res.json({ success: true, user });
  } catch (error) {
    logger.error(`Error en getProfile: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { nombre, email } = req.body;
    const updatedUser = await User.update(req.user.id, { nombre, email });
    return res.json({ success: true, user: updatedUser });
  } catch (error) {
    logger.error(`Error en updateProfile: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const resetPassword = async (req, res) => {
  return res.status(501).json({
    success: false,
    message: 'Recuperación de contraseña por token aún no configurada en CoreX',
  });
};

module.exports = {
  login,
  register,
  verify,
  getProfile,
  updateProfile,
  logout,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
