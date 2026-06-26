// Archivo: userRoutes.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: userRoutes.js                                                 */
/*  📁 UBICACIÓN: backend/src/routes/userRoutes.js                            */
/*  🚀 MÓDULO: Rutas                                                          */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Rutas para la gestión de usuarios del sistema. Permite administrar       */
/*  cuentas de administradores y cajeros.                                    */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Obtener todos los usuarios (admin)                                     */
/*  ✅ Obtener usuario por ID (admin)                                         */
/*  ✅ Crear nuevo usuario (admin)                                            */
/*  ✅ Actualizar usuario (admin)                                             */
/*  ✅ Eliminar usuario (admin)                                               */
/*  ✅ Obtener perfil propio                                                  */
/*  ✅ Actualizar perfil propio                                               */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • userController - Lógica de usuarios                                     */
/*  • authMiddleware - Verificación de token                                  */
/*  • roleMiddleware - Verificación de roles                                  */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: server.js                                                */
/*  • Usa: userController                                                     */
/*  • Prefix: /api/users                                                      */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Solo administradores pueden gestionar otros usuarios                   */
/*  • No se puede eliminar el último administrador                            */
/*  • Los cajeros solo pueden ver y editar su propio perfil                   */
/*  • Las contraseñas se almacenan hasheadas                                  */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Rutas CRUD para administración                                      */
/*      ✅ Rutas de perfil propio                                             */
/*      ✅ Protección por roles                                                */
/*                                                                            */
/* ========================================================================== */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

/* ========================================================================== */
/*  RUTAS DE PERFIL PROPIO (USUARIO AUTENTICADO)                              */
/* ========================================================================== */

/**
 * @route   GET /api/users/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 * @returns { user }
 */
router.get('/profile', authMiddleware, userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Actualizar perfil del usuario autenticado
 * @access  Private
 * @body    { nombre, email, currentPassword, newPassword }
 * @returns { user }
 */
router.put('/profile', authMiddleware, userController.updateProfile);

/* ========================================================================== */
/*  RUTAS DE ADMINISTRACIÓN (SOLO ADMINISTRADORES)                            */
/* ========================================================================== */

/**
 * @route   GET /api/users
 * @desc    Obtener todos los usuarios del sistema
 * @access  Private (Admin)
 * @returns { users, total }
 */
router.get('/', authMiddleware, isAdmin, userController.getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener usuario por ID
 * @access  Private (Admin)
 * @param   { id }
 * @returns { user }
 */
router.get('/:id', authMiddleware, isAdmin, userController.getUserById);

/**
 * @route   POST /api/users
 * @desc    Crear nuevo usuario (admin o cajero)
 * @access  Private (Admin)
 * @body    { nombre, email, password, role }
 * @returns { user }
 */
router.post('/', authMiddleware, isAdmin, userController.createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar usuario existente
 * @access  Private (Admin)
 * @param   { id }
 * @body    { nombre, email, role, password }
 * @returns { user }
 */
router.put('/:id', authMiddleware, isAdmin, userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Eliminar usuario (no permite eliminar último admin)
 * @access  Private (Admin)
 * @param   { id }
 * @returns { message }
 */
router.delete('/:id', authMiddleware, isAdmin, userController.deleteUser);

/* ========================================================================== */
/*  EXPORTAR ROUTER                                                           */
/* ========================================================================== */

module.exports = router;