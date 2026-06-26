// Archivo: authRoutes.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: authRoutes.js                                                 */
/*  📁 UBICACIÓN: backend/src/routes/authRoutes.js                            */
/*  🚀 MÓDULO: Rutas                                                          */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Rutas de autenticación y gestión de sesiones. Maneja el login, registro  */
/*  y obtención de perfil de usuario.                                        */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Login de usuario (admin o cajero)                                      */
/*  ✅ Obtener perfil del usuario autenticado                                 */
/*  ✅ Cambiar contraseña                                                     */
/*  ✅ Cerrar sesión (cliente-side)                                          */
/*  ✅ Renovar token JWT                                                      */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • authController - Lógica de autenticación                                */
/*  • authMiddleware - Verificación de token                                  */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: server.js                                                */
/*  • Usa: authController                                                     */
/*  • Prefix: /api/auth                                                       */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Las rutas públicas no requieren autenticación                           */
/*  • Las rutas protegidas requieren token válido                             */
/*  • El token debe enviarse en header: Authorization: Bearer <token>        */
/*  • El token expira según configuración (default 8 horas)                   */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Ruta de login                                                      */
/*      ✅ Ruta de perfil                                                     */
/*      ✅ Ruta de cambio de contraseña                                       */
/*      ✅ Ruta de renovación de token                                        */
/*                                                                            */
/* ========================================================================== */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

/* ========================================================================== */
/*  RUTAS PÚBLICAS (NO REQUIEREN AUTENTICACIÓN)                               */
/* ========================================================================== */

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión - Autentica usuario y retorna token JWT
 * @access  Public
 * @body    { email, password }
 * @returns { token, user }
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/auth/verify
 * @desc    Verificar token JWT activo
 * @access  Private
 * @returns { valid, user }
 */
router.get('/verify', authController.verify);

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario (solo accesible por admin)
 * @access  Private (Admin)
 * @body    { nombre, email, password, role }
 * @returns { user }
 */
router.post('/register', authMiddleware, authController.register);

/* ========================================================================== */
/*  RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN)                                */
/* ========================================================================== */

/**
 * @route   GET /api/auth/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 * @returns { user }
 */
router.get('/profile', authMiddleware, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Actualizar perfil del usuario autenticado
 * @access  Private
 * @body    { nombre, email, currentPassword, newPassword }
 * @returns { user }
 */
router.put('/profile', authMiddleware, authController.updateProfile);

/**
 * @route   POST /api/auth/change-password
 * @desc    Cambiar contraseña del usuario autenticado
 * @access  Private
 * @body    { currentPassword, newPassword }
 * @returns { message }
 */
router.post('/change-password', authMiddleware, authController.changePassword);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Renovar token JWT (extender sesión)
 * @access  Private
 * @returns { token }
 */
router.post('/refresh-token', authMiddleware, authController.refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión (invalida token en cliente)
 * @access  Private
 * @returns { message }
 */
router.post('/logout', authMiddleware, authController.logout);

/* ========================================================================== */
/*  RUTAS DE RECUPERACIÓN DE CONTRASEÑA (OPCIONAL)                            */
/* ========================================================================== */

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Solicitar recuperación de contraseña
 * @access  Public
 * @body    { email }
 * @returns { message }
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Restablecer contraseña con token
 * @access  Public
 * @body    { token, newPassword }
 * @returns { message }
 */
router.post('/reset-password', authController.resetPassword);

/* ========================================================================== */
/*  EXPORTAR ROUTER                                                           */
/* ========================================================================== */

module.exports = router;