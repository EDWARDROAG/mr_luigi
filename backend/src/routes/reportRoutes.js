// Archivo: reportRoutes.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: reportRoutes.js                                               */
/*  📁 UBICACIÓN: backend/src/routes/reportRoutes.js                          */
/*  🚀 MÓDULO: Rutas                                                          */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Rutas para la generación de reportes y estadísticas del negocio.         */
/*  Permite obtener métricas de ventas, inventario y rendimiento.            */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Dashboard con métricas rápidas                                         */
/*  ✅ Reporte de ventas por período                                          */
/*  ✅ Reporte de ventas por vendedor                                         */
/*  ✅ Reporte de productos más vendidos                                      */
/*  ✅ Reporte de inventario                                                  */
/*  ✅ Cierre de caja por día                                                 */
/*  ✅ Exportación a CSV                                                      */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • reportController - Lógica de reportes                                   */
/*  • authMiddleware - Verificación de token                                  */
/*  • roleMiddleware - Verificación de roles                                  */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: server.js                                                */
/*  • Usa: reportController                                                   */
/*  • Prefix: /api/reports                                                    */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Solo administradores pueden acceder a reportes                         */
/*  • Soporte para exportación CSV en la mayoría de reportes                 */
/*  • Los reportes pueden filtrarse por fechas                                */
/*  • Los datos se calculan en tiempo real                                    */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Dashboard de métricas                                              */
/*      ✅ Reporte de ventas                                                  */
/*      ✅ Reporte por vendedor                                               */
/*      ✅ Top productos                                                      */
/*      ✅ Inventario                                                         */
/*      ✅ Cierre de caja                                                     */
/*                                                                            */
/* ========================================================================== */

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

/* ========================================================================== */
/*  RUTAS DE REPORTES (SOLO ADMINISTRADORES)                                  */
/* ========================================================================== */

/**
 * @route   GET /api/reports/dashboard
 * @desc    Obtener métricas rápidas del dashboard
 * @access  Private (Admin)
 * @returns { ventas_hoy, ventas_semana, ventas_mes, inventario, usuarios }
 */
router.get(
    '/dashboard',
    authMiddleware,
    isAdmin,
    reportController.getDashboardMetrics
);

/**
 * @route   GET /api/reports/sales
 * @desc    Reporte de ventas por período
 * @access  Private (Admin)
 * @query   { fecha_desde, fecha_hasta, formato (json/csv) }
 * @returns { periodo, resumen, por_metodo_pago, ventas }
 */
router.get(
    '/sales',
    authMiddleware,
    isAdmin,
    reportController.getSalesReport
);

/**
 * @route   GET /api/reports/sales-by-seller
 * @desc    Reporte de ventas agrupado por vendedor
 * @access  Private (Admin)
 * @query   { fecha_desde, fecha_hasta, vendedor_id }
 * @returns { periodo, vendedores }
 */
router.get(
    '/sales-by-seller',
    authMiddleware,
    isAdmin,
    reportController.getSalesBySellerReport
);

/**
 * @route   GET /api/reports/top-products
 * @desc    Reporte de productos más vendidos
 * @access  Private (Admin)
 * @query   { fecha_desde, fecha_hasta, limit }
 * @returns { periodo, top_productos }
 */
router.get(
    '/top-products',
    authMiddleware,
    isAdmin,
    reportController.getTopProductsReport
);

/**
 * @route   GET /api/reports/inventory
 * @desc    Reporte de inventario (disponibles y vendidos)
 * @access  Private (Admin)
 * @query   { condicion, categoria_id, formato (json/csv) }
 * @returns { resumen, productos }
 */
router.get(
    '/inventory',
    authMiddleware,
    isAdmin,
    reportController.getInventoryReport
);

/**
 * @route   GET /api/reports/cashier-closure
 * @desc    Reporte de cierre de caja por día
 * @access  Private (Admin)
 * @query   { fecha (YYYY-MM-DD) }
 * @returns { fecha, resumen_general, por_vendedor, ventas }
 */
router.get(
    '/cashier-closure',
    authMiddleware,
    isAdmin,
    reportController.getCashierClosureReport
);

/* ========================================================================== */
/*  EXPORTAR ROUTER                                                           */
/* ========================================================================== */

module.exports = router;