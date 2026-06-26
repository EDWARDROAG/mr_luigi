// Archivo: reportController.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: reportController.js                                           */
/*  📁 UBICACIÓN: backend/src/controllers/reportController.js                 */
/*  🚀 MÓDULO: Controladores                                                  */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-22 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Controlador para la generación de reportes y estadísticas del negocio.   */
/*  Permite al administrador visualizar ventas por período, por vendedor,    */
/*  productos más vendidos, y análisis de rendimiento general.               */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Reporte de ventas por período (día, semana, mes, personalizado)        */
/*  ✅ Reporte de ventas por vendedor (cajero)                                */
/*  ✅ Reporte de productos más vendidos                                      */
/*  ✅ Reporte de inventario (productos disponibles y vendidos)               */
/*  ✅ Reporte de ventas por método de pago (efectivo vs transferencia)       */
/*  ✅ Dashboard de métricas rápidas (totales, promedios)                     */
/*  ✅ Exportación de reportes a CSV/Excel                                    */
/*  ✅ Cierre de caja por día                                                 */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • Sale Model - Consultas de ventas                                        */
/*  • SaleItem Model - Ítems de venta                                         */
/*  • Product Model - Consultas de productos                                  */
/*  • User Model - Información de vendedores                                  */
/*  • Log Model - Registro de acciones                                        */
/*  • database - Conexión a PostgreSQL                                        */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: reportRoutes.js                                          */
/*  • Usa: Sale, SaleItem, Product, User, Log                                 */
/*  • Solo accesible por administradores                                      */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Solo administradores pueden ver reportes                               */
/*  • Los reportes pueden filtrarse por rango de fechas                       */
/*  • Los datos se agrupan y suman automáticamente                            */
/*  • Exportación a CSV disponible para todos los reportes                    */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-22                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Reporte de ventas por período                                      */
/*      ✅ Reporte por vendedor                                               */
/*      ✅ Productos más vendidos                                             */
/*      ✅ Dashboard de métricas                                              */
/*      ✅ Exportación a CSV                                                  */
/*      ✅ Cierre de caja                                                     */
/*                                                                            */
/* ========================================================================== */

const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const Product = require('../models/Product');
const User = require('../models/User');
const Log = require('../models/Log');
const { query } = require('../config/database');

/* ========================================================================== */
/*  DASHBOARD - MÉTRICAS RÁPIDAS                                              */
/* ========================================================================== */

const getDashboardMetrics = async (req, res) => {
    try {
        // Ventas de hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const salesToday = await Sale.getSummaryByDate(today);
        
        // Ventas de la semana (últimos 7 días)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        
        const salesWeek = await Sale.getSummaryByDateRange(weekAgo, new Date());
        
        // Ventas del mes (últimos 30 días)
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        monthAgo.setHours(0, 0, 0, 0);
        
        const salesMonth = await Sale.getSummaryByDateRange(monthAgo, new Date());
        
        // Total de productos disponibles
        const availableProductsResult = await query(
            'SELECT COUNT(*) as total FROM products WHERE stock = 1'
        );
        const availableProducts = parseInt(availableProductsResult.rows[0].total);
        
        // Total de productos vendidos
        const soldProductsResult = await query(
            'SELECT COUNT(*) as total FROM products WHERE stock = 0'
        );
        const soldProducts = parseInt(soldProductsResult.rows[0].total);
        
        // Total de usuarios
        const usersResult = await User.findAll();
        const admins = usersResult.filter(u => u.role === 'admin').length;
        const cajeros = usersResult.filter(u => u.role === 'cajero').length;
        
        // Registrar acceso al dashboard (log)
        await Log.create({
            usuario_id: req.user.id,
            accion: 'VER_DASHBOARD',
            detalle: 'Acceso al dashboard de métricas'
        });
        
        res.status(200).json({
            success: true,
            data: {
                ventas_hoy: {
                    total_ventas: salesToday.total_ventas || 0,
                    total_facturado: salesToday.total_facturado || 0
                },
                ventas_semana: {
                    total_ventas: salesWeek.total_ventas || 0,
                    total_facturado: salesWeek.total_facturado || 0
                },
                ventas_mes: {
                    total_ventas: salesMonth.total_ventas || 0,
                    total_facturado: salesMonth.total_facturado || 0
                },
                inventario: {
                    disponibles: availableProducts,
                    vendidos: soldProducts,
                    total: availableProducts + soldProducts
                },
                usuarios: {
                    total: usersResult.length,
                    administradores: admins,
                    cajeros: cajeros
                }
            }
        });
        
    } catch (error) {
        console.error('Error en getDashboardMetrics:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener métricas del dashboard',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  REPORTE DE VENTAS POR PERÍODO                                            */
/* ========================================================================== */

const getSalesReport = async (req, res) => {
    try {
        const { fecha_desde, fecha_hasta, formato = 'json' } = req.query;
        
        // Validar fechas
        let startDate, endDate;
        
        if (fecha_desde && fecha_hasta) {
            startDate = new Date(fecha_desde);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(fecha_hasta);
            endDate.setHours(23, 59, 59, 999);
        } else if (fecha_desde) {
            startDate = new Date(fecha_desde);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
        } else {
            // Por defecto, últimos 30 días
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
        }
        
        // Obtener ventas del período
        const sales = await Sale.getSalesByDateRange(startDate, endDate);
        
        // Calcular estadísticas
        const totalVentas = sales.length;
        const totalFacturado = sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
        const promedioVenta = totalVentas > 0 ? totalFacturado / totalVentas : 0;
        
        // Ventas por método de pago
        const efectivoSales = sales.filter(s => s.metodo_pago === 'efectivo');
        const transferenciaSales = sales.filter(s => s.metodo_pago === 'transferencia');
        
        const totalEfectivo = efectivoSales.reduce((sum, s) => sum + parseFloat(s.total), 0);
        const totalTransferencia = transferenciaSales.reduce((sum, s) => sum + parseFloat(s.total), 0);
        
        const reportData = {
            periodo: {
                desde: startDate.toISOString(),
                hasta: endDate.toISOString()
            },
            resumen: {
                total_ventas: totalVentas,
                total_facturado: totalFacturado,
                promedio_venta: promedioVenta
            },
            por_metodo_pago: {
                efectivo: {
                    cantidad: efectivoSales.length,
                    total: totalEfectivo,
                    porcentaje: totalVentas > 0 ? (efectivoSales.length / totalVentas) * 100 : 0
                },
                transferencia: {
                    cantidad: transferenciaSales.length,
                    total: totalTransferencia,
                    porcentaje: totalVentas > 0 ? (transferenciaSales.length / totalVentas) * 100 : 0
                }
            },
            ventas: sales.map(sale => ({
                factura_numero: sale.factura_numero,
                fecha: sale.fecha_venta,
                vendedor: sale.vendedor_nombre,
                cliente: sale.cliente_nombre,
                metodo_pago: sale.metodo_pago,
                total: sale.total
            }))
        };
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'GENERAR_REPORTE_VENTAS',
            detalle: `Reporte de ventas generado: ${startDate.toISOString().split('T')[0]} a ${endDate.toISOString().split('T')[0]}`
        });
        
        // Exportar a CSV si se solicita
        if (formato === 'csv') {
            const csvRows = [
                ['Factura #', 'Fecha', 'Vendedor', 'Cliente', 'Método Pago', 'Total']
            ];
            
            for (const sale of sales) {
                csvRows.push([
                    sale.factura_numero,
                    new Date(sale.fecha_venta).toLocaleString('es-CO'),
                    sale.vendedor_nombre || 'N/A',
                    sale.cliente_nombre || 'N/A',
                    sale.metodo_pago === 'efectivo' ? 'Efectivo' : 'Transferencia',
                    sale.total
                ]);
            }
            
            const csvContent = csvRows.map(row => row.join(',')).join('\n');
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename=reporte_ventas_${Date.now()}.csv`);
            return res.send('\uFEFF' + csvContent);
        }
        
        res.status(200).json({
            success: true,
            data: reportData
        });
        
    } catch (error) {
        console.error('Error en getSalesReport:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar reporte de ventas',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  REPORTE DE VENTAS POR VENDEDOR                                            */
/* ========================================================================== */

const getSalesBySellerReport = async (req, res) => {
    try {
        const { fecha_desde, fecha_hasta, vendedor_id } = req.query;
        
        // Validar fechas
        let startDate, endDate;
        
        if (fecha_desde && fecha_hasta) {
            startDate = new Date(fecha_desde);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(fecha_hasta);
            endDate.setHours(23, 59, 59, 999);
        } else {
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
        }
        
        // Obtener ventas agrupadas por vendedor
        const queryText = `
            SELECT 
                u.id as vendedor_id,
                u.nombre as vendedor_nombre,
                COUNT(s.id) as total_ventas,
                COALESCE(SUM(s.total), 0) as total_facturado,
                COALESCE(AVG(s.total), 0) as promedio_venta,
                COUNT(CASE WHEN s.metodo_pago = 'efectivo' THEN 1 END) as ventas_efectivo,
                COALESCE(SUM(CASE WHEN s.metodo_pago = 'efectivo' THEN s.total END), 0) as total_efectivo,
                COUNT(CASE WHEN s.metodo_pago = 'transferencia' THEN 1 END) as ventas_transferencia,
                COALESCE(SUM(CASE WHEN s.metodo_pago = 'transferencia' THEN s.total END), 0) as total_transferencia
            FROM users u
            LEFT JOIN sales s ON u.id = s.vendedor_id 
                AND s.fecha_venta BETWEEN $1 AND $2
                AND s.estado = 'completada'
            WHERE u.role IN ('cajero', 'admin')
            ${vendedor_id ? 'AND u.id = $3' : ''}
            GROUP BY u.id, u.nombre
            ORDER BY total_facturado DESC
        `;
        
        const params = [startDate, endDate];
        if (vendedor_id) params.push(parseInt(vendedor_id));
        
        const result = await query(queryText, params);
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'GENERAR_REPORTE_VENDEDORES',
            detalle: `Reporte por vendedor generado: ${startDate.toISOString().split('T')[0]} a ${endDate.toISOString().split('T')[0]}`
        });
        
        res.status(200).json({
            success: true,
            data: {
                periodo: {
                    desde: startDate.toISOString(),
                    hasta: endDate.toISOString()
                },
                vendedores: result.rows
            }
        });
        
    } catch (error) {
        console.error('Error en getSalesBySellerReport:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar reporte por vendedor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  REPORTE DE PRODUCTOS MÁS VENDIDOS                                         */
/* ========================================================================== */

const getTopProductsReport = async (req, res) => {
    try {
        const { fecha_desde, fecha_hasta, limit = 10, formato = 'json' } = req.query;
        
        // Validar fechas
        let startDate, endDate;
        
        if (fecha_desde && fecha_hasta) {
            startDate = new Date(fecha_desde);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(fecha_hasta);
            endDate.setHours(23, 59, 59, 999);
        } else {
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
        }
        
        const queryText = `
            SELECT 
                p.id,
                p.nombre,
                p.precio,
                c.nombre as categoria,
                COUNT(si.id) as veces_vendido,
                SUM(si.cantidad) as cantidad_total,
                SUM(si.subtotal) as total_generado
            FROM sale_items si
            JOIN products p ON si.producto_id = p.id
            JOIN sales s ON si.sale_id = s.id
            LEFT JOIN categories c ON p.categoria_id = c.id
            WHERE s.fecha_venta BETWEEN $1 AND $2
                AND s.estado = 'completada'
            GROUP BY p.id, p.nombre, p.precio, c.nombre
            ORDER BY cantidad_total DESC
            LIMIT $3
        `;
        
        const result = await query(queryText, [startDate, endDate, parseInt(limit)]);
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'GENERAR_REPORTE_TOP_PRODUCTOS',
            detalle: `Top ${limit} productos generado`
        });
        
        // Exportar a CSV si se solicita
        if (formato === 'csv') {
            const csvRows = [
                ['Producto', 'Categoría', 'Veces Vendido', 'Cantidad Total', 'Total Generado', 'Precio Unitario']
            ];
            
            for (const product of result.rows) {
                csvRows.push([
                    product.nombre,
                    product.categoria || 'Sin categoría',
                    product.veces_vendido,
                    product.cantidad_total,
                    product.total_generado,
                    product.precio
                ]);
            }
            
            const csvContent = csvRows.map(row => row.join(',')).join('\n');
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename=top_productos_${Date.now()}.csv`);
            return res.send('\uFEFF' + csvContent);
        }
        
        res.status(200).json({
            success: true,
            data: {
                periodo: {
                    desde: startDate.toISOString(),
                    hasta: endDate.toISOString()
                },
                top_productos: result.rows
            }
        });
        
    } catch (error) {
        console.error('Error en getTopProductsReport:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar reporte de productos más vendidos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  REPORTE DE INVENTARIO                                                    */
/* ========================================================================== */

const getInventoryReport = async (req, res) => {
    try {
        const { condicion, categoria_id, formato = 'json' } = req.query;
        
        // Construir consulta
        let queryText = `
            SELECT 
                p.id,
                p.nombre,
                p.precio,
                p.condicion,
                p.stock,
                p.fecha_registro,
                CASE 
                    WHEN p.stock = 1 THEN 'Disponible'
                    ELSE 'Vendido'
                END as estado,
                c.nombre as categoria,
                p.vendido_en
            FROM products p
            LEFT JOIN categories c ON p.categoria_id = c.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramIndex = 1;
        
        if (condicion) {
            queryText += ` AND p.condicion = $${paramIndex}`;
            params.push(condicion);
            paramIndex++;
        }
        
        if (categoria_id) {
            queryText += ` AND p.categoria_id = $${paramIndex}`;
            params.push(parseInt(categoria_id));
            paramIndex++;
        }
        
        queryText += ` ORDER BY p.fecha_registro DESC`;
        
        const result = await query(queryText, params);
        
        const disponibles = result.rows.filter(p => p.stock === 1);
        const vendidos = result.rows.filter(p => p.stock === 0);
        const valorInventario = disponibles.reduce((sum, p) => sum + parseFloat(p.precio), 0);
        
        const reportData = {
            resumen: {
                total_productos: result.rows.length,
                disponibles: disponibles.length,
                vendidos: vendidos.length,
                valor_inventario: valorInventario,
                valor_promedio: result.rows.length > 0 ? valorInventario / result.rows.length : 0
            },
            productos: result.rows
        };
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'GENERAR_REPORTE_INVENTARIO',
            detalle: `Reporte de inventario generado`
        });
        
        // Exportar a CSV si se solicita
        if (formato === 'csv') {
            const csvRows = [
                ['ID', 'Nombre', 'Precio', 'Condición', 'Estado', 'Categoría', 'Fecha Venta']
            ];
            
            for (const product of result.rows) {
                csvRows.push([
                    product.id,
                    product.nombre,
                    product.precio,
                    product.condicion === 'nuevo' ? 'Nuevo' : 'Segunda',
                    product.estado,
                    product.categoria || 'Sin categoría',
                    product.vendido_en ? new Date(product.vendido_en).toLocaleDateString('es-CO') : 'N/A'
                ]);
            }
            
            const csvContent = csvRows.map(row => row.join(',')).join('\n');
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename=reporte_inventario_${Date.now()}.csv`);
            return res.send('\uFEFF' + csvContent);
        }
        
        res.status(200).json({
            success: true,
            data: reportData
        });
        
    } catch (error) {
        console.error('Error en getInventoryReport:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar reporte de inventario',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  REPORTE DE CIERRE DE CAJA                                                 */
/* ========================================================================== */

const getCashierClosureReport = async (req, res) => {
    try {
        const { fecha } = req.query;
        
        let targetDate;
        if (fecha) {
            targetDate = new Date(fecha);
        } else {
            targetDate = new Date();
        }
        targetDate.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        // Obtener ventas del día
        const sales = await Sale.getSalesByDateRange(targetDate, nextDay);
        
        // Calcular totales por vendedor
        const salesBySeller = {};
        for (const sale of sales) {
            if (!salesBySeller[sale.vendedor_id]) {
                salesBySeller[sale.vendedor_id] = {
                    vendedor_id: sale.vendedor_id,
                    vendedor_nombre: sale.vendedor_nombre,
                    total_ventas: 0,
                    total_facturado: 0,
                    efectivo: 0,
                    transferencia: 0
                };
            }
            
            salesBySeller[sale.vendedor_id].total_ventas++;
            salesBySeller[sale.vendedor_id].total_facturado += parseFloat(sale.total);
            
            if (sale.metodo_pago === 'efectivo') {
                salesBySeller[sale.vendedor_id].efectivo += parseFloat(sale.total);
            } else {
                salesBySeller[sale.vendedor_id].transferencia += parseFloat(sale.total);
            }
        }
        
        const totalEfectivo = sales.filter(s => s.metodo_pago === 'efectivo')
            .reduce((sum, s) => sum + parseFloat(s.total), 0);
        const totalTransferencia = sales.filter(s => s.metodo_pago === 'transferencia')
            .reduce((sum, s) => sum + parseFloat(s.total), 0);
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'GENERAR_CIERRE_CAJA',
            detalle: `Cierre de caja generado para fecha: ${targetDate.toISOString().split('T')[0]}`
        });
        
        res.status(200).json({
            success: true,
            data: {
                fecha: targetDate.toISOString().split('T')[0],
                resumen_general: {
                    total_ventas: sales.length,
                    total_facturado: totalEfectivo + totalTransferencia,
                    total_efectivo: totalEfectivo,
                    total_transferencia: totalTransferencia
                },
                por_vendedor: Object.values(salesBySeller),
                ventas: sales.map(sale => ({
                    factura_numero: sale.factura_numero,
                    hora: new Date(sale.fecha_venta).toLocaleTimeString('es-CO'),
                    vendedor: sale.vendedor_nombre,
                    cliente: sale.cliente_nombre,
                    metodo_pago: sale.metodo_pago,
                    total: sale.total
                }))
            }
        });
        
    } catch (error) {
        console.error('Error en getCashierClosureReport:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar reporte de cierre de caja',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  EXPORTAR CONTROLADORES                                                    */
/* ========================================================================== */

module.exports = {
    getDashboardMetrics,
    getSalesReport,
    getSalesBySellerReport,
    getTopProductsReport,
    getInventoryReport,
    getCashierClosureReport
};