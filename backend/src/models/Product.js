/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: Product.js                                                    */
/*  📁 UBICACIÓN: backend/src/models/Product.js                               */
/*  🚀 MÓDULO: Modelos                                                        */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Modelo para la gestión de productos. Maneja inventario, categorías,      */
/*  condiciones (nuevo/segunda), y estado de disponibilidad.                 */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ CRUD completo de productos                                             */
/*  ✅ Búsqueda con filtros (categoría, condición, destacado)                 */
/*  ✅ Paginación para manejar hasta 10,000 productos                         */
/*  ✅ Marcar producto como vendido                                           */
/*  ✅ Actualización masiva de precios                                        */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • database.js - Conexión a PostgreSQL                                     */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: productController                                        */
/*  • Relacionado con: Category, SaleItem                                     */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • stock: 0 = agotado/vendido, 1 = disponible                             */
/*  • condicion: 'nuevo' o 'segunda'                                          */
/*  • Las imágenes se almacenan en uploads/productos/                         */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Implementación CRUD completo                                       */
/*      ✅ Búsqueda paginada y filtros                                        */
/*                                                                            */
/* ========================================================================== */

const { query } = require('../config/database');

/* ========================================================================== */
/*  CREAR PRODUCTO                                                            */
/* ========================================================================== */

const create = async (productData) => {
    const { nombre, descripcion, precio, condicion, categoria_id, imagen_url, destacado } = productData;
    
    const result = await query(
        `INSERT INTO products 
         (nombre, descripcion, precio, condicion, categoria_id, imagen_url, destacado, stock, fecha_registro)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 1, NOW())
         RETURNING *`,
        [nombre, descripcion, precio, condicion, categoria_id, imagen_url, destacado || false]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  BUSCAR PRODUCTO POR ID                                                    */
/* ========================================================================== */

const findById = async (id) => {
    const result = await query(
        `SELECT p.*, c.nombre as categoria_nombre 
         FROM products p
         LEFT JOIN categories c ON p.categoria_id = c.id
         WHERE p.id = $1`,
        [id]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  LISTAR PRODUCTOS CON FILTROS Y PAGINACIÓN                                 */
/* ========================================================================== */

const findAll = async (filters = {}, page = 1, limit = 20) => {
    const { categoria_id, condicion, destacado, search } = filters;
    const offset = (page - 1) * limit;
    
    let queryText = `
        SELECT p.*, c.nombre as categoria_nombre 
        FROM products p
        LEFT JOIN categories c ON p.categoria_id = c.id
        WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    
    // Aplicar filtros
    if (categoria_id) {
        queryText += ` AND p.categoria_id = $${paramIndex}`;
        params.push(categoria_id);
        paramIndex++;
    }
    
    if (condicion) {
        queryText += ` AND p.condicion = $${paramIndex}`;
        params.push(condicion);
        paramIndex++;
    }
    
    if (destacado !== undefined) {
        queryText += ` AND p.destacado = $${paramIndex}`;
        params.push(destacado);
        paramIndex++;
    }
    
    if (search) {
        queryText += ` AND p.nombre ILIKE $${paramIndex}`;
        params.push(`%${search}%`);
        paramIndex++;
    }
    
    // Ordenar por fecha de registro (más recientes primero)
    queryText += ` ORDER BY p.fecha_registro DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await query(queryText, params);
    
    // Contar total para paginación
    let countQuery = `SELECT COUNT(*) FROM products p WHERE 1=1`;
    const countParams = [];
    let countIndex = 1;
    
    if (categoria_id) {
        countQuery += ` AND p.categoria_id = $${countIndex}`;
        countParams.push(categoria_id);
        countIndex++;
    }
    
    if (condicion) {
        countQuery += ` AND p.condicion = $${countIndex}`;
        countParams.push(condicion);
        countIndex++;
    }
    
    if (search) {
        countQuery += ` AND p.nombre ILIKE $${countIndex}`;
        countParams.push(`%${search}%`);
        countIndex++;
    }
    
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    return {
        products: result.rows,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/* ========================================================================== */
/*  ACTUALIZAR PRODUCTO                                                       */
/* ========================================================================== */

const update = async (id, productData) => {
    const { nombre, descripcion, precio, condicion, categoria_id, imagen_url, destacado, stock } = productData;
    
    let queryText = 'UPDATE products SET ';
    const params = [];
    let paramIndex = 1;
    
    if (nombre !== undefined) {
        queryText += `nombre = $${paramIndex}, `;
        params.push(nombre);
        paramIndex++;
    }
    
    if (descripcion !== undefined) {
        queryText += `descripcion = $${paramIndex}, `;
        params.push(descripcion);
        paramIndex++;
    }
    
    if (precio !== undefined) {
        queryText += `precio = $${paramIndex}, `;
        params.push(precio);
        paramIndex++;
    }
    
    if (condicion !== undefined) {
        queryText += `condicion = $${paramIndex}, `;
        params.push(condicion);
        paramIndex++;
    }
    
    if (categoria_id !== undefined) {
        queryText += `categoria_id = $${paramIndex}, `;
        params.push(categoria_id);
        paramIndex++;
    }
    
    if (imagen_url !== undefined) {
        queryText += `imagen_url = $${paramIndex}, `;
        params.push(imagen_url);
        paramIndex++;
    }
    
    if (destacado !== undefined) {
        queryText += `destacado = $${paramIndex}, `;
        params.push(destacado);
        paramIndex++;
    }
    
    if (stock !== undefined) {
        queryText += `stock = $${paramIndex}, `;
        params.push(stock);
        paramIndex++;
    }
    
    // Remover última coma y espacio
    queryText = queryText.slice(0, -2);
    queryText += ` WHERE id = $${paramIndex} RETURNING *`;
    params.push(id);
    
    const result = await query(queryText, params);
    return result.rows[0];
};

/* ========================================================================== */
/*  MARCAR PRODUCTO COMO VENDIDO                                              */
/* ========================================================================== */

const markAsSold = async (id) => {
    const result = await query(
        `UPDATE products 
         SET stock = 0, vendido_en = NOW() 
         WHERE id = $1 
         RETURNING *`,
        [id]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  ELIMINAR PRODUCTO                                                         */
/* ========================================================================== */

const remove = async (id) => {
    const result = await query(
        'DELETE FROM products WHERE id = $1 RETURNING id',
        [id]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  ACTUALIZAR PRECIOS EN MASA                                                */
/* ========================================================================== */

const bulkUpdatePrice = async (percentage) => {
    const multiplier = 1 + (percentage / 100);
    
    const result = await query(
        `UPDATE products 
         SET precio = precio * $1 
         WHERE stock = 1 
         RETURNING id, nombre, precio`,
        [multiplier]
    );
    
    return result.rows;
};

/* ========================================================================== */
/*  PRODUCTOS DESTACADOS PARA HOME                                            */
/* ========================================================================== */

const getDestacados = async (limit = 8) => {
    const result = await query(
        `SELECT p.*, c.nombre as categoria_nombre 
         FROM products p
         LEFT JOIN categories c ON p.categoria_id = c.id
         WHERE p.destacado = true AND p.stock = 1
         ORDER BY p.fecha_registro DESC
         LIMIT $1`,
        [limit]
    );
    
    return result.rows;
};

module.exports = {
    create,
    findById,
    findAll,
    update,
    markAsSold,
    remove,
    bulkUpdatePrice,
    getDestacados
};