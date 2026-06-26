// Archivo: productRoutes.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: productRoutes.js                                              */
/*  📁 UBICACIÓN: backend/src/routes/productRoutes.js                         */
/*  🚀 MÓDULO: Rutas                                                          */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Rutas para la gestión de productos. Maneja operaciones CRUD, búsqueda,   */
/*  filtros y actualización masiva de precios.                               */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Obtener todos los productos (con filtros y paginación)                 */
/*  ✅ Obtener producto por ID                                                */
/*  ✅ Crear nuevo producto (admin)                                           */
/*  ✅ Actualizar producto (admin)                                            */
/*  ✅ Eliminar producto (admin)                                              */
/*  ✅ Marcar producto como vendido (admin/cajero)                            */
/*  ✅ Actualizar precios en masa (admin)                                     */
/*  ✅ Obtener productos destacados para home                                 */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • productController - Lógica de productos                                 */
/*  • authMiddleware - Verificación de token                                  */
/*  • roleMiddleware - Verificación de roles                                  */
/*  • uploadMiddleware - Subida de imágenes                                   */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: server.js                                                */
/*  • Usa: productController                                                  */
/*  • Prefix: /api/products                                                   */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Las rutas públicas no requieren autenticación                           */
/*  • Crear, editar y eliminar solo para administradores                      */
/*  • Marcar como vendido disponible para admin y cajero                      */
/*  • Subida de imágenes requiere autenticación                               */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Rutas CRUD completas                                               */
/*      ✅ Protección por roles                                                */
/*      ✅ Subida de imágenes                                                  */
/*      ✅ Actualización masiva                                                */
/*                                                                            */
/* ========================================================================== */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isAdmin, isCajero } = require('../middlewares/roleMiddleware');
const { uploadProductImage } = require('../middlewares/uploadMiddleware');

/* ========================================================================== */
/*  RUTAS PÚBLICAS (NO REQUIEREN AUTENTICACIÓN)                               */
/* ========================================================================== */

/**
 * @route   GET /api/products
 * @desc    Obtener todos los productos con filtros y paginación
 * @access  Public
 * @query   { categoria_id, condicion, destacado, search, page, limit }
 * @returns { products, pagination }
 */
router.get('/', productController.getProducts);

/**
 * @route   GET /api/products/destacados
 * @desc    Obtener productos destacados para el home
 * @access  Public
 * @query   { limit }
 * @returns { products }
 */
router.get('/destacados', productController.getDestacados);

/**
 * @route   GET /api/products/:id
 * @desc    Obtener producto por ID
 * @access  Public
 * @param   { id }
 * @returns { product }
 */
router.get('/:id', productController.getProductById);

/* ========================================================================== */
/*  RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN)                                */
/* ========================================================================== */

/**
 * @route   POST /api/products
 * @desc    Crear nuevo producto
 * @access  Private (Admin)
 * @body    { nombre, descripcion, precio, condicion, categoria_id, destacado }
 * @returns { product }
 */
router.post(
    '/',
    authMiddleware,
    isAdmin,
    uploadProductImage.single('imagen'),
    productController.createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Actualizar producto existente
 * @access  Private (Admin)
 * @param   { id }
 * @body    { nombre, descripcion, precio, condicion, categoria_id, destacado, stock }
 * @returns { product }
 */
router.put(
    '/:id',
    authMiddleware,
    isAdmin,
    uploadProductImage.single('imagen'),
    productController.updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Eliminar producto (soft delete o hard delete)
 * @access  Private (Admin)
 * @param   { id }
 * @returns { message }
 */
router.delete(
    '/:id',
    authMiddleware,
    isAdmin,
    productController.deleteProduct
);

/**
 * @route   PATCH /api/products/:id/sold
 * @desc    Marcar producto como vendido
 * @access  Private (Admin o Cajero)
 * @param   { id }
 * @returns { product }
 */
router.patch(
    '/:id/sold',
    authMiddleware,
    isCajero,
    productController.markProductAsSold
);

/**
 * @route   POST /api/products/bulk/update-prices
 * @desc    Actualizar precios en masa (porcentaje)
 * @access  Private (Admin)
 * @body    { percentage }
 * @returns { updatedProducts }
 */
router.post(
    '/bulk/update-prices',
    authMiddleware,
    isAdmin,
    productController.bulkUpdatePrices
);

/* ========================================================================== */
/*  EXPORTAR ROUTER                                                           */
/* ========================================================================== */

module.exports = router;