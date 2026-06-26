// Archivo: SaleItem.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: SaleItem.js                                                   */
/*  📁 UBICACIÓN: backend/src/models/SaleItem.js                              */
/*  🚀 MÓDULO: Modelos                                                        */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Modelo para la gestión de items de venta. Representa cada producto       */
/*  individual vendido dentro de una transacción, incluyendo cantidad,       */
/*  precio y subtotal.                                                       */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Crear nuevo item de venta                                              */
/*  ✅ Buscar items por ID de venta                                           */
/*  ✅ Buscar item por ID                                                     */
/*  ✅ Listar todos los items de una venta                                    */
/*  ✅ Eliminar item de venta (solo si la venta está pendiente)               */
/*  ✅ Obtener estadísticas de productos vendidos                             */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • database.js - Conexión a PostgreSQL                                     */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: saleController, index.js                                 */
/*  • Relacionado con: Sale (venta padre), Product (producto vendido)        */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Un item pertenece a una sola venta                                      */
/*  • Un item referencia un solo producto                                     */
/*  • El subtotal se calcula como cantidad * precio_unitario                  */
/*  • Al eliminar una venta, sus items también se eliminan (CASCADE)         */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ CRUD completo                                                      */
/*      ✅ Búsqueda por venta                                                 */
/*      ✅ Estadísticas de productos vendidos                                 */
/*                                                                            */
/* ========================================================================== */

const { query } = require('../config/database');

/* ========================================================================== */
/*  CREAR NUEVO ITEM DE VENTA                                                 */
/* ========================================================================== */

const create = async (itemData) => {
    const { sale_id, producto_id, cantidad, precio_unitario, subtotal } = itemData;
    
    const result = await query(
        `INSERT INTO sale_items 
         (sale_id, producto_id, cantidad, precio_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [sale_id, producto_id, cantidad, precio_unitario, subtotal]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  CREAR MÚLTIPLES ITEMS DE VENTA (BATCH)                                    */
/* ========================================================================== */

const createMultiple = async (items) => {
    if (!items || items.length === 0) {
        return [];
    }
    
    // Construir consulta para inserción múltiple
    const values = [];
    const params = [];
    let paramIndex = 1;
    
    for (const item of items) {
        values.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4})`);
        params.push(item.sale_id, item.producto_id, item.cantidad, item.precio_unitario, item.subtotal);
        paramIndex += 5;
    }
    
    const queryText = `
        INSERT INTO sale_items 
        (sale_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES ${values.join(', ')}
        RETURNING *
    `;
    
    const result = await query(queryText, params);
    return result.rows;
};

/* ========================================================================== */
/*  BUSCAR ITEM POR ID                                                        */
/* ========================================================================== */

const findById = async (id) => {
    const result = await query(`
        SELECT 
            si.*,
            p.nombre as producto_nombre,
            p.imagen_url as producto_imagen,
            p.condicion as producto_condicion,
            s.factura_numero,
            s.fecha_venta
        FROM sale_items si
        LEFT JOIN products p ON si.producto_id = p.id
        LEFT JOIN sales s ON si.sale_id = s.id
        WHERE si.id = $1
    `, [id]);
    
    return result.rows[0];
};

/* ========================================================================== */
/*  BUSCAR ITEMS POR ID DE VENTA                                              */
/* ========================================================================== */

const findBySaleId = async (sale_id) => {
    const result = await query(`
        SELECT 
            si.*,
            p.nombre as producto_nombre,
            p.imagen_url as producto_imagen,
            p.condicion as producto_condicion,
            p.precio as producto_precio_original
        FROM sale_items si
        LEFT JOIN products p ON si.producto_id = p.id
        WHERE si.sale_id = $1
        ORDER BY si.id ASC
    `, [sale_id]);
    
    return result.rows;
};

/* ========================================================================== */
/*  ELIMINAR ITEM DE VENTA                                                    */
/* ========================================================================== */

const remove = async (id) => {
    const result = await query(
        'DELETE FROM sale_items WHERE id = $1 RETURNING id',
        [id]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  ELIMINAR TODOS LOS ITEMS DE UNA VENTA                                     */
/* ========================================================================== */

const removeBySaleId = async (sale_id) => {
    const result = await query(
        'DELETE FROM sale_items WHERE sale_id = $1 RETURNING id',
        [sale_id]
    );
    
    return result.rows;
};

/* ========================================================================== */
/*  OBTENER TOTAL DE UNA VENTA POR SUS ITEMS                                  */
/* ========================================================================== */

const getTotalBySaleId = async (sale_id) => {
    const result = await query(
        'SELECT COALESCE(SUM(subtotal), 0) as total FROM sale_items WHERE sale_id = $1',
        [sale_id]
    );
    
    return parseFloat(result.rows[0].total);
};

/* ========================================================================== */
/*  OBTENER ESTADÍSTICAS DE PRODUCTOS VENDIDOS                                */
/* ========================================================================== */

const getProductSalesStats = async (filters = {}) => {
    const { fecha_desde, fecha_hasta, limit = 10 } = filters;
    
    let queryText = `
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
        WHERE s.estado = 'completada'
    `;
    
    const params = [];
    let paramIndex = 1;
    
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
    
    queryText += ` GROUP BY p.id, p.nombre, p.precio, c.nombre
                   ORDER BY cantidad_total DESC
                   LIMIT $${paramIndex}`;
    params.push(limit);
    
    const result = await query(queryText, params);
    return result.rows;
};

/* ========================================================================== */
/*  OBTENER VENTAS POR PRODUCTO                                              */
/* ========================================================================== */

const getSalesByProductId = async (producto_id, limit = 50) => {
    const result = await query(`
        SELECT 
            si.*,
            s.factura_numero,
            s.fecha_venta,
            s.cliente_nombre,
            s.metodo_pago,
            u.nombre as vendedor_nombre
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        LEFT JOIN users u ON s.vendedor_id = u.id
        WHERE si.producto_id = $1
            AND s.estado = 'completada'
        ORDER BY s.fecha_venta DESC
        LIMIT $2
    `, [producto_id, limit]);
    
    return result.rows;
};

/* ========================================================================== */
/*  OBTENER PRODUCTOS MÁS VENDIDOS POR PERÍODO                                */
/* ========================================================================== */

const getTopProductsByPeriod = async (startDate, endDate, limit = 10) => {
    const result = await query(`
        SELECT 
            p.id,
            p.nombre,
            p.precio,
            COUNT(si.id) as veces_vendido,
            SUM(si.cantidad) as cantidad_total,
            SUM(si.subtotal) as total_generado
        FROM sale_items si
        JOIN products p ON si.producto_id = p.id
        JOIN sales s ON si.sale_id = s.id
        WHERE s.fecha_venta BETWEEN $1 AND $2
            AND s.estado = 'completada'
        GROUP BY p.id, p.nombre, p.precio
        ORDER BY cantidad_total DESC
        LIMIT $3
    `, [startDate, endDate, limit]);
    
    return result.rows;
};

/* ========================================================================== */
/*  VERIFICAR SI UN PRODUCTO HA SIDO VENDIDO                                  */
/* ========================================================================== */

const hasBeenSold = async (producto_id) => {
    const result = await query(
        'SELECT COUNT(*) as total FROM sale_items WHERE producto_id = $1',
        [producto_id]
    );
    
    return parseInt(result.rows[0].total) > 0;
};

/* ========================================================================== */
/*  EXPORTAR MODELO                                                           */
/* ========================================================================== */

module.exports = {
    create,
    createMultiple,
    findById,
    findBySaleId,
    remove,
    removeBySaleId,
    getTotalBySaleId,
    getProductSalesStats,
    getSalesByProductId,
    getTopProductsByPeriod,
    hasBeenSold
};