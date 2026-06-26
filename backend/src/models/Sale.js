// Archivo: Sale.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: Sale.js                                                       */
/*  📁 UBICACIÓN: backend/src/models/Sale.js                                  */
/*  🚀 MÓDULO: Modelos                                                        */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Modelo para la gestión de ventas. Maneja el registro de transacciones,   */
/*  facturación, métodos de pago, comprobantes y relación con productos.     */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Crear nueva venta                                                      */
/*  ✅ Buscar venta por ID con detalles                                       */
/*  ✅ Listar ventas con filtros y paginación                                 */
/*  ✅ Cancelar venta                                                         */
/*  ✅ Actualizar comprobante de venta                                        */
/*  ✅ Obtener resumen de ventas por período                                  */
/*  ✅ Obtener ventas por vendedor                                            */
/*  ✅ Restaurar stock de productos al cancelar                               */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • database.js - Conexión a PostgreSQL                                     */
/*  • SaleItem - Modelo de items de venta                                     */
/*  • Product - Modelo de productos                                           */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: saleController, index.js                                 */
/*  • Relacionado con: User (vendedor), SaleItem (items), Product (productos)*/
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • El número de factura es autoincremental                                 */
/*  • El estado puede ser 'completada' o 'cancelada'                          */
/*  • Transferencia requiere comprobante_url                                  */
/*  • Al cancelar, se restaura el stock de los productos                      */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ CRUD completo                                                      */
/*      ✅ Cancelación con restauración de stock                              */
/*      ✅ Reportes por período y vendedor                                     */
/*                                                                            */
/* ========================================================================== */

const { query } = require('../config/database');
const Product = require('./Product');

/* ========================================================================== */
/*  CREAR NUEVA VENTA                                                         */
/* ========================================================================== */

const create = async (saleData) => {
    const { vendedor_id, cliente_nombre, cliente_telefono, metodo_pago, comprobante_url, total } = saleData;
    
    const result = await query(
        `INSERT INTO sales 
         (vendedor_id, cliente_nombre, cliente_telefono, metodo_pago, comprobante_url, total, fecha_venta, estado)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), 'completada')
         RETURNING *`,
        [vendedor_id, cliente_nombre, cliente_telefono, metodo_pago, comprobante_url, total]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  BUSCAR VENTA POR ID CON DETALLES COMPLETOS                                */
/* ========================================================================== */

const findById = async (id) => {
    // Obtener venta principal
    const saleResult = await query(`
        SELECT 
            s.*,
            u.nombre as vendedor_nombre,
            u.email as vendedor_email
        FROM sales s
        LEFT JOIN users u ON s.vendedor_id = u.id
        WHERE s.id = $1
    `, [id]);
    
    if (saleResult.rows.length === 0) {
        return null;
    }
    
    const sale = saleResult.rows[0];
    
    // Obtener items de la venta
    const itemsResult = await query(`
        SELECT 
            si.*,
            p.nombre as producto_nombre,
            p.imagen_url as producto_imagen,
            p.condicion as producto_condicion
        FROM sale_items si
        LEFT JOIN products p ON si.producto_id = p.id
        WHERE si.sale_id = $1
    `, [id]);
    
    sale.items = itemsResult.rows;
    
    return sale;
};

/* ========================================================================== */
/*  LISTAR VENTAS CON FILTROS Y PAGINACIÓN                                    */
/* ========================================================================== */

const findAll = async (filters = {}, page = 1, limit = 20) => {
    const { vendedor_id, metodo_pago, fecha_desde, fecha_hasta } = filters;
    const offset = (page - 1) * limit;
    
    let queryText = `
        SELECT 
            s.*,
            u.nombre as vendedor_nombre
        FROM sales s
        LEFT JOIN users u ON s.vendedor_id = u.id
        WHERE s.estado = 'completada'
    `;
    const params = [];
    let paramIndex = 1;
    
    if (vendedor_id) {
        queryText += ` AND s.vendedor_id = $${paramIndex}`;
        params.push(vendedor_id);
        paramIndex++;
    }
    
    if (metodo_pago) {
        queryText += ` AND s.metodo_pago = $${paramIndex}`;
        params.push(metodo_pago);
        paramIndex++;
    }
    
    if (fecha_desde) {
        queryText += ` AND s.fecha_venta >= $${paramIndex}`;
        params.push(fecha_desde);
        paramIndex++;
    }
    
    if (fecha_hasta) {
        queryText += ` AND s.fecha_venta <= $${paramIndex}`;
        params.push(fecha_hasta);
        paramIndex++;
    }
    
    queryText += ` ORDER BY s.fecha_venta DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await query(queryText, params);
    
    // Contar total para paginación
    let countQuery = `SELECT COUNT(*) FROM sales s WHERE s.estado = 'completada'`;
    const countParams = [];
    let countIndex = 1;
    
    if (vendedor_id) {
        countQuery += ` AND s.vendedor_id = $${countIndex}`;
        countParams.push(vendedor_id);
        countIndex++;
    }
    
    if (metodo_pago) {
        countQuery += ` AND s.metodo_pago = $${countIndex}`;
        countParams.push(metodo_pago);
        countIndex++;
    }
    
    if (fecha_desde) {
        countQuery += ` AND s.fecha_venta >= $${countIndex}`;
        countParams.push(fecha_desde);
        countIndex++;
    }
    
    if (fecha_hasta) {
        countQuery += ` AND s.fecha_venta <= $${countIndex}`;
        countParams.push(fecha_hasta);
        countIndex++;
    }
    
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    return {
        sales: result.rows,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/* ========================================================================== */
/*  ACTUALIZAR COMPROBANTE DE VENTA                                           */
/* ========================================================================== */

const updateReceipt = async (id, comprobante_url) => {
    const result = await query(
        `UPDATE sales 
         SET comprobante_url = $1 
         WHERE id = $2 
         RETURNING *`,
        [comprobante_url, id]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  CANCELAR VENTA                                                            */
/* ========================================================================== */

const cancel = async (id, motivo) => {
    const result = await query(
        `UPDATE sales 
         SET estado = 'cancelada', 
             motivo_cancelacion = $1,
             fecha_cancelacion = NOW()
         WHERE id = $2 
         RETURNING *`,
        [motivo, id]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  RESTAURAR STOCK DE PRODUCTOS AL CANCELAR                                  */
/* ========================================================================== */

const restoreProductStock = async (producto_id) => {
    const result = await query(
        `UPDATE products 
         SET stock = 1, vendido_en = NULL 
         WHERE id = $1 
         RETURNING *`,
        [producto_id]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  OBTENER VENTAS POR RANGO DE FECHAS                                        */
/* ========================================================================== */

const getSalesByDateRange = async (startDate, endDate) => {
    const result = await query(`
        SELECT 
            s.*,
            u.nombre as vendedor_nombre
        FROM sales s
        LEFT JOIN users u ON s.vendedor_id = u.id
        WHERE s.fecha_venta BETWEEN $1 AND $2
            AND s.estado = 'completada'
        ORDER BY s.fecha_venta DESC
    `, [startDate, endDate]);
    
    return result.rows;
};

/* ========================================================================== */
/*  OBTENER RESUMEN DE VENTAS POR FECHA                                       */
/* ========================================================================== */

const getSummaryByDate = async (date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const result = await query(`
        SELECT 
            COUNT(*) as total_ventas,
            COALESCE(SUM(total), 0) as total_facturado
        FROM sales
        WHERE fecha_venta BETWEEN $1 AND $2
            AND estado = 'completada'
    `, [startOfDay, endOfDay]);
    
    return result.rows[0];
};

/* ========================================================================== */
/*  OBTENER RESUMEN DE VENTAS POR RANGO DE FECHAS                             */
/* ========================================================================== */

const getSummaryByDateRange = async (startDate, endDate) => {
    const result = await query(`
        SELECT 
            COUNT(*) as total_ventas,
            COALESCE(SUM(total), 0) as total_facturado,
            COUNT(CASE WHEN metodo_pago = 'efectivo' THEN 1 END) as efectivo_count,
            COALESCE(SUM(CASE WHEN metodo_pago = 'efectivo' THEN total END), 0) as efectivo_total,
            COUNT(CASE WHEN metodo_pago = 'transferencia' THEN 1 END) as transferencia_count,
            COALESCE(SUM(CASE WHEN metodo_pago = 'transferencia' THEN total END), 0) as transferencia_total
        FROM sales
        WHERE fecha_venta BETWEEN $1 AND $2
            AND estado = 'completada'
    `, [startDate, endDate]);
    
    return result.rows[0];
};

/* ========================================================================== */
/*  OBTENER RESUMEN DE VENTAS POR VENDEDOR                                    */
/* ========================================================================== */

const getSummaryBySeller = async (filters = {}) => {
    const { vendedor_id, fecha_desde, fecha_hasta } = filters;
    
    let queryText = `
        SELECT 
            u.id as vendedor_id,
            u.nombre as vendedor_nombre,
            COUNT(s.id) as total_ventas,
            COALESCE(SUM(s.total), 0) as total_facturado,
            COUNT(CASE WHEN s.metodo_pago = 'efectivo' THEN 1 END) as ventas_efectivo,
            COALESCE(SUM(CASE WHEN s.metodo_pago = 'efectivo' THEN s.total END), 0) as total_efectivo,
            COUNT(CASE WHEN s.metodo_pago = 'transferencia' THEN 1 END) as ventas_transferencia,
            COALESCE(SUM(CASE WHEN s.metodo_pago = 'transferencia' THEN s.total END), 0) as total_transferencia
        FROM users u
        LEFT JOIN sales s ON u.id = s.vendedor_id AND s.estado = 'completada'
        WHERE u.role IN ('admin', 'cajero')
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (vendedor_id) {
        queryText += ` AND u.id = $${paramIndex}`;
        params.push(vendedor_id);
        paramIndex++;
    }
    
    if (fecha_desde) {
        queryText += ` AND s.fecha_venta >= $${paramIndex}`;
        params.push(fecha_desde);
        paramIndex++;
    }
    
    if (fecha_hasta) {
        queryText += ` AND s.fecha_venta <= $${paramIndex}`;
        params.push(fecha_hasta);
        paramIndex++;
    }
    
    queryText += ` GROUP BY u.id, u.nombre ORDER BY total_facturado DESC`;
    
    const result = await query(queryText, params);
    return result.rows;
};

/* ========================================================================== */
/*  OBTENER ÚLTIMO NÚMERO DE FACTURA                                          */
/* ========================================================================== */

const getLastInvoiceNumber = async () => {
    const result = await query(`
        SELECT MAX(factura_numero) as last_number
        FROM sales
    `);
    
    return result.rows[0].last_number || 0;
};

/* ========================================================================== */
/*  EXPORTAR MODELO                                                           */
/* ========================================================================== */

module.exports = {
    create,
    findById,
    findAll,
    updateReceipt,
    cancel,
    restoreProductStock,
    getSalesByDateRange,
    getSummaryByDate,
    getSummaryByDateRange,
    getSummaryBySeller,
    getLastInvoiceNumber
};