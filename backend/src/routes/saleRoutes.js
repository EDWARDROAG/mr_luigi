// Archivo: saleRoutes.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: saleRoutes.js                                                 */
/*  📁 UBICACIÓN: backend/src/routes/saleRoutes.js                            */
/*  🚀 MÓDULO: Rutas                                                          */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Rutas para la gestión de ventas. Maneja el proceso completo de venta,    */
/*  incluyendo múltiples productos, métodos de pago, comprobantes y facturas.*/
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Registrar nueva venta (múltiples productos)                            */
/*  ✅ Obtener todas las ventas (con filtros)                                 */
/*  ✅ Obtener venta por ID                                                   */
/*  ✅ Cancelar venta (admin)                                                 */
/*  ✅ Subir comprobante de transferencia                                     */
/*  ✅ Generar factura PDF                                                    */
/*  ✅ Obtener resumen de ventas por vendedor                                 */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • saleController - Lógica de ventas                                       */
/*  • authMiddleware - Verificación de token                                  */
/*  • roleMiddleware - Verificación de roles                                  */
/*  • uploadMiddleware - Subida de comprobantes                               */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: server.js                                                */
/*  • Usa: saleController                                                     */
/*  • Prefix: /api/sales                                                      */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Admin y cajero pueden registrar ventas                                  */
/*  • Solo admin puede cancelar ventas                                        */
/*  • Transferencia requiere subir comprobante                                */
/*  • La factura se genera en formato PDF para impresión térmica 80mm         */
/*  • Al registrar venta, el stock se actualiza automáticamente               */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Ruta de registro de venta                                          */
/*      ✅ Ruta de listado con filtros                                        */
/*      ✅ Ruta de cancelación                                                */
/*      ✅ Ruta de subida de comprobantes                                     */
/*      ✅ Ruta de generación de factura                                      */
/*                                                                            */
/* ========================================================================== */

const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isAdmin, isCajero } = require('../middlewares/roleMiddleware');
const { uploadReceipt } = require('../middlewares/uploadMiddleware');

/* ========================================================================== */
/*  RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN)                                */
/* ========================================================================== */

/**
 * @route   POST /api/sales
 * @desc    Registrar nueva venta (múltiples productos)
 * @access  Private (Admin o Cajero)
 * @body    { items, cliente_nombre, cliente_telefono, metodo_pago, total }
 * @returns { sale, factura_pdf }
 */
router.post(
    '/',
    authMiddleware,
    isCajero,
    uploadReceipt.single('comprobante'),
    saleController.createSale
);

/**
 * @route   GET /api/sales
 * @desc    Obtener todas las ventas con filtros y paginación
 * @access  Private (Admin o Cajero)
 * @query   { vendedor_id, metodo_pago, fecha_desde, fecha_hasta, page, limit }
 * @returns { sales, pagination }
 */
router.get(
    '/',
    authMiddleware,
    isCajero,
    saleController.getSales
);

/**
 * @route   GET /api/sales/orders
 * @desc    Alias de listado de ventas (compatibilidad frontend)
 * @access  Private (Admin o Cajero)
 */
router.get(
    '/orders',
    authMiddleware,
    isCajero,
    saleController.getSales
);

/**
 * @route   GET /api/sales/summary/seller
 * @desc    Obtener resumen de ventas por vendedor
 * @access  Private (Admin)
 * @query   { fecha_desde, fecha_hasta, vendedor_id }
 * @returns { summary }
 */
router.get(
    '/summary/seller',
    authMiddleware,
    isAdmin,
    saleController.getSalesSummaryBySeller
);

/**
 * @route   GET /api/sales/:id
 * @desc    Obtener venta por ID con detalles completos
 * @access  Private (Admin o Cajero)
 * @param   { id }
 * @returns { sale }
 */
router.get(
    '/:id',
    authMiddleware,
    isCajero,
    saleController.getSaleById
);

/**
 * @route   POST /api/sales/:id/receipt
 * @desc    Subir comprobante de transferencia para una venta existente
 * @access  Private (Admin o Cajero)
 * @param   { id }
 * @body    { comprobante (file) }
 * @returns { sale }
 */
router.post(
    '/:id/receipt',
    authMiddleware,
    isCajero,
    uploadReceipt.single('comprobante'),
    saleController.uploadTransferReceipt
);

/**
 * @route   GET /api/sales/:id/invoice
 * @desc    Generar y descargar factura PDF de una venta
 * @access  Private (Admin o Cajero)
 * @param   { id }
 * @returns { PDF file }
 */
router.get(
    '/:id/invoice',
    authMiddleware,
    isCajero,
    saleController.generateSaleInvoice
);

/**
 * @route   DELETE /api/sales/:id/cancel
 * @desc    Cancelar venta (restaura stock de productos)
 * @access  Private (Admin)
 * @param   { id }
 * @body    { motivo }
 * @returns { sale }
 */
router.delete(
    '/:id/cancel',
    authMiddleware,
    isAdmin,
    saleController.cancelSale
);

/* ========================================================================== */
/*  EXPORTAR ROUTER                                                           */
/* ========================================================================== */

module.exports = router;