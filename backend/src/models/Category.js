// Archivo: Category.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: Category.js                                                   */
/*  📁 UBICACIÓN: backend/src/models/Category.js                              */
/*  🚀 MÓDULO: Modelos                                                        */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Modelo para la gestión de categorías de productos. Permite organizar     */
/*  los productos en categorías como 'Celulares', 'Laptops', 'Impresoras',   */
/*  'Accesorios', etc., y clasificarlas por tipo (venta, mantenimiento).     */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Crear nueva categoría                                                  */
/*  ✅ Buscar categoría por ID                                                */
/*  ✅ Buscar categoría por nombre                                            */
/*  ✅ Listar todas las categorías                                            */
/*  ✅ Listar categorías por tipo                                             */
/*  ✅ Actualizar categoría                                                   */
/*  ✅ Eliminar categoría                                                     */
/*  ✅ Obtener categorías con conteo de productos                             */
/*  ✅ Verificar si categoría tiene productos asociados                       */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • database.js - Conexión a PostgreSQL                                     */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: categoryController, index.js                             */
/*  • Relacionado con: Product (una categoría tiene muchos productos)        */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Tipos disponibles: 'venta', 'mantenimiento', 'accesorio'               */
/*  • No se puede eliminar una categoría con productos asociados             */
/*  • Las categorías se usan para filtrar en el frontend                      */
/*  • El nombre de la categoría debe ser único                                */
/*  • Las categorías se ordenan alfabéticamente por defecto                   */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ CRUD completo                                                      */
/*      ✅ Búsqueda por nombre y tipo                                         */
/*      ✅ Conteo de productos por categoría                                   */
/*      ✅ Verificación de productos asociados                                */
/*                                                                            */
/* ========================================================================== */

const { query } = require('../config/database');

/* ========================================================================== */
/*  CREAR CATEGORÍA                                                           */
/* ========================================================================== */

const create = async (categoryData) => {
    const { nombre, tipo, descripcion } = categoryData;
    
    const result = await query(
        `INSERT INTO categories (nombre, tipo, descripcion, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING id, nombre, tipo, descripcion, created_at`,
        [nombre, tipo, descripcion || '']
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  BUSCAR CATEGORÍA POR ID                                                   */
/* ========================================================================== */

const findById = async (id) => {
    const result = await query(
        `SELECT id, nombre, tipo, descripcion, created_at 
         FROM categories 
         WHERE id = $1`,
        [id]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  BUSCAR CATEGORÍA POR NOMBRE                                               */
/* ========================================================================== */

const findByName = async (nombre) => {
    const result = await query(
        `SELECT id, nombre, tipo, descripcion, created_at 
         FROM categories 
         WHERE nombre = $1`,
        [nombre]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  LISTAR TODAS LAS CATEGORÍAS                                               */
/* ========================================================================== */

const findAll = async () => {
    const result = await query(
        `SELECT id, nombre, tipo, descripcion, created_at 
         FROM categories 
         ORDER BY nombre ASC`
    );
    
    return result.rows;
};

/* ========================================================================== */
/*  LISTAR CATEGORÍAS POR TIPO                                                */
/* ========================================================================== */

const findByType = async (tipo) => {
    const result = await query(
        `SELECT id, nombre, tipo, descripcion, created_at 
         FROM categories 
         WHERE tipo = $1 
         ORDER BY nombre ASC`,
        [tipo]
    );
    
    return result.rows;
};

/* ========================================================================== */
/*  ACTUALIZAR CATEGORÍA                                                      */
/* ========================================================================== */

const update = async (id, categoryData) => {
    const { nombre, tipo, descripcion } = categoryData;
    
    let queryText = 'UPDATE categories SET ';
    const params = [];
    let paramIndex = 1;
    
    if (nombre !== undefined) {
        queryText += `nombre = $${paramIndex}, `;
        params.push(nombre);
        paramIndex++;
    }
    
    if (tipo !== undefined) {
        queryText += `tipo = $${paramIndex}, `;
        params.push(tipo);
        paramIndex++;
    }
    
    if (descripcion !== undefined) {
        queryText += `descripcion = $${paramIndex}, `;
        params.push(descripcion);
        paramIndex++;
    }
    
    // Remover última coma y espacio
    queryText = queryText.slice(0, -2);
    queryText += ` WHERE id = $${paramIndex} RETURNING id, nombre, tipo, descripcion, created_at`;
    params.push(id);
    
    const result = await query(queryText, params);
    return result.rows[0];
};

/* ========================================================================== */
/*  ELIMINAR CATEGORÍA                                                        */
/* ========================================================================== */

const remove = async (id) => {
    const result = await query(
        'DELETE FROM categories WHERE id = $1 RETURNING id',
        [id]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  OBTENER CATEGORÍAS CON CONTEO DE PRODUCTOS                                */
/* ========================================================================== */

const findAllWithProductCount = async () => {
    const result = await query(`
        SELECT 
            c.id,
            c.nombre,
            c.tipo,
            c.descripcion,
            c.created_at,
            COUNT(p.id) as total_productos,
            COUNT(CASE WHEN p.stock = 1 THEN 1 END) as disponibles,
            COUNT(CASE WHEN p.stock = 0 THEN 1 END) as vendidos
        FROM categories c
        LEFT JOIN products p ON c.id = p.categoria_id
        GROUP BY c.id, c.nombre, c.tipo, c.descripcion, c.created_at
        ORDER BY c.nombre ASC
    `);
    
    return result.rows;
};

/* ========================================================================== */
/*  VERIFICAR SI CATEGORÍA TIENE PRODUCTOS                                    */
/* ========================================================================== */

const hasProducts = async (id) => {
    const result = await query(
        'SELECT COUNT(*) as total FROM products WHERE categoria_id = $1',
        [id]
    );
    
    return parseInt(result.rows[0].total) > 0;
};

/* ========================================================================== */
/*  OBTENER CATEGORÍAS POR TIPO CON CONTEO                                    */
/* ========================================================================== */

const findByTypeWithCount = async (tipo) => {
    const result = await query(`
        SELECT 
            c.id,
            c.nombre,
            c.tipo,
            c.descripcion,
            c.created_at,
            COUNT(p.id) as total_productos,
            COUNT(CASE WHEN p.stock = 1 THEN 1 END) as disponibles,
            COUNT(CASE WHEN p.stock = 0 THEN 1 END) as vendidos
        FROM categories c
        LEFT JOIN products p ON c.id = p.categoria_id
        WHERE c.tipo = $1
        GROUP BY c.id, c.nombre, c.tipo, c.descripcion, c.created_at
        ORDER BY c.nombre ASC
    `, [tipo]);
    
    return result.rows;
};

/* ========================================================================== */
/*  OBTENER CATEGORÍA CON DETALLE COMPLETO                                    */
/* ========================================================================== */

const getCategoryWithDetails = async (id) => {
    const result = await query(`
        SELECT 
            c.id,
            c.nombre,
            c.tipo,
            c.descripcion,
            c.created_at,
            COUNT(p.id) as total_productos,
            COUNT(CASE WHEN p.stock = 1 THEN 1 END) as disponibles,
            COUNT(CASE WHEN p.stock = 0 THEN 1 END) as vendidos,
            json_agg(
                json_build_object(
                    'id', p.id,
                    'nombre', p.nombre,
                    'precio', p.precio,
                    'condicion', p.condicion,
                    'stock', p.stock
                ) ORDER BY p.fecha_registro DESC
            ) FILTER (WHERE p.id IS NOT NULL) as ultimos_productos
        FROM categories c
        LEFT JOIN products p ON c.id = p.categoria_id
        WHERE c.id = $1
        GROUP BY c.id, c.nombre, c.tipo, c.descripcion, c.created_at
    `, [id]);
    
    return result.rows[0];
};

/* ========================================================================== */
/*  EXPORTAR MODELO                                                           */
/* ========================================================================== */

module.exports = {
    create,
    findById,
    findByName,
    findAll,
    findByType,
    update,
    remove,
    findAllWithProductCount,
    hasProducts,
    findByTypeWithCount,
    getCategoryWithDetails
};