// Archivo: categoryRoutes.js
// CoreX - Generado automáticamente
/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: categoryRoutes.js                                             */
/*  📁 UBICACIÓN: backend/src/routes/categoryRoutes.js                        */
/*  🚀 MÓDULO: Rutas                                                          */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Rutas para la gestión de categorías. Permite administrar las categorías  */
/*  de productos y filtrar por tipo (venta, mantenimiento, accesorio).       */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Obtener todas las categorías                                           */
/*  ✅ Obtener categorías por tipo                                            */
/*  ✅ Obtener categoría por ID                                               */
/*  ✅ Crear nueva categoría (admin)                                          */
/*  ✅ Actualizar categoría (admin)                                           */
/*  ✅ Eliminar categoría (admin)                                             */
/*  ✅ Obtener categorías con conteo de productos                             */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • categoryController - Lógica de categorías                               */
/*  • authMiddleware - Verificación de token                                  */
/*  • roleMiddleware - Verificación de roles                                  */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: server.js                                                */
/*  • Usa: categoryController                                                 */
/*  • Prefix: /api/categories                                                 */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Las rutas públicas no requieren autenticación                           */
/*  • Crear, editar y eliminar solo para administradores                      */
/*  • No se puede eliminar una categoría con productos asociados              */
/*  • Tipos disponibles: 'venta', 'mantenimiento', 'accesorio'               */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Rutas CRUD completas                                               */
/*      ✅ Filtrado por tipo                                                  */
/*      ✅ Protección por roles                                                */
/*      ✅ Conteo de productos por categoría                                   */
/*                                                                            */
/* ========================================================================== */

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

/* ========================================================================== */
/*  RUTAS PÚBLICAS (NO REQUIEREN AUTENTICACIÓN)                               */
/* ========================================================================== */

/**
 * @route   GET /api/categories
 * @desc    Obtener todas las categorías
 * @access  Public
 * @query   { tipo } - Filtrar por tipo (venta, mantenimiento, accesorio)
 * @returns { categories, total }
 */
router.get('/', categoryController.getCategories);

/**
 * @route   GET /api/categories/with-count
 * @desc    Obtener categorías con conteo de productos
 * @access  Public
 * @returns { categories }
 */
router.get('/with-count', categoryController.getCategoriesWithCount);

/**
 * @route   GET /api/categories/:id
 * @desc    Obtener categoría por ID
 * @access  Public
 * @param   { id }
 * @returns { category, total_productos }
 */
router.get('/:id', categoryController.getCategoryById);

/* ========================================================================== */
/*  RUTAS PROTEGIDAS (SOLO ADMINISTRADORES)                                   */
/* ========================================================================== */

/**
 * @route   POST /api/categories
 * @desc    Crear nueva categoría
 * @access  Private (Admin)
 * @body    { nombre, tipo, descripcion }
 * @returns { category }
 */
router.post(
    '/',
    authMiddleware,
    isAdmin,
    categoryController.createCategory
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Actualizar categoría existente
 * @access  Private (Admin)
 * @param   { id }
 * @body    { nombre, tipo, descripcion }
 * @returns { category }
 */
router.put(
    '/:id',
    authMiddleware,
    isAdmin,
    categoryController.updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Eliminar categoría (solo si no tiene productos)
 * @access  Private (Admin)
 * @param   { id }
 * @returns { message }
 */
router.delete(
    '/:id',
    authMiddleware,
    isAdmin,
    categoryController.deleteCategory
);

/* ========================================================================== */
/*  EXPORTAR ROUTER                                                           */
/* ========================================================================== */

module.exports = router;