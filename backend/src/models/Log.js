// Archivo: Log.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: Log.js                                                        */
/*  📁 UBICACIÓN: backend/src/models/Log.js                                   */
/*  🚀 MÓDULO: Modelos                                                        */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Modelo para el registro de auditoría y logs del sistema. Almacena todas  */
/*  las acciones importantes realizadas por los usuarios para trazabilidad  */
/*  y seguridad.                                                             */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Registrar nueva acción en el log                                       */
/*  ✅ Buscar logs por ID                                                     */
/*  ✅ Listar logs con filtros y paginación                                   */
/*  ✅ Buscar logs por usuario                                                */
/*  ✅ Buscar logs por tipo de acción                                         */
/*  ✅ Buscar logs por rango de fechas                                        */
/*  ✅ Limpiar logs antiguos                                                  */
/*  ✅ Obtener estadísticas de logs por tipo de acción                       */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • database.js - Conexión a PostgreSQL                                     */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: logController, index.js                                  */
/*  • Relacionado con: User (usuario que realizó la acción)                  */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Los logs son inmutables (no se pueden modificar)                       */
/*  • Se recomienda limpiar logs antiguos periódicamente                     */
/*  • Tipos de acción: CREAR_PRODUCTO, ELIMINAR_PRODUCTO, CREAR_VENTA, etc.  */
/*  • Los logs ayudan en auditoría y debugging                               */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ CRUD completo                                                      */
/*      ✅ Filtros avanzados                                                  */
/*      ✅ Limpieza automática                                                */
/*      ✅ Estadísticas por acción                                            */
/*                                                                            */
/* ========================================================================== */

const { query } = require('../config/database');

/* ========================================================================== */
/*  REGISTRAR NUEVA ACCIÓN EN EL LOG                                          */
/* ========================================================================== */

const create = async (logData) => {
    const { usuario_id, accion, detalle, ip_address, user_agent } = logData;
    
    const result = await query(
        `INSERT INTO logs 
         (usuario_id, accion, detalle, ip_address, user_agent, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING *`,
        [usuario_id, accion, detalle || null, ip_address || null, user_agent || null]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  BUSCAR LOG POR ID                                                         */
/* ========================================================================== */

const findById = async (id) => {
    const result = await query(`
        SELECT 
            l.*,
            u.nombre as usuario_nombre,
            u.email as usuario_email,
            u.role as usuario_role
        FROM logs l
        LEFT JOIN users u ON l.usuario_id = u.id
        WHERE l.id = $1
    `, [id]);
    
    return result.rows[0];
};

/* ========================================================================== */
/*  LISTAR LOGS CON FILTROS Y PAGINACIÓN                                      */
/* ========================================================================== */

const findAll = async (filters = {}, page = 1, limit = 50) => {
    const { usuario_id, accion, fecha_desde, fecha_hasta } = filters;
    const offset = (page - 1) * limit;
    
    let queryText = `
        SELECT 
            l.*,
            u.nombre as usuario_nombre,
            u.email as usuario_email
        FROM logs l
        LEFT JOIN users u ON l.usuario_id = u.id
        WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    
    if (usuario_id) {
        queryText += ` AND l.usuario_id = $${paramIndex}`;
        params.push(usuario_id);
        paramIndex++;
    }
    
    if (accion) {
        queryText += ` AND l.accion = $${paramIndex}`;
        params.push(accion);
        paramIndex++;
    }
    
    if (fecha_desde) {
        queryText += ` AND l.created_at >= $${paramIndex}`;
        params.push(fecha_desde);
        paramIndex++;
    }
    
    if (fecha_hasta) {
        queryText += ` AND l.created_at <= $${paramIndex}`;
        params.push(fecha_hasta);
        paramIndex++;
    }
    
    queryText += ` ORDER BY l.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await query(queryText, params);
    
    // Contar total para paginación
    let countQuery = `SELECT COUNT(*) FROM logs l WHERE 1=1`;
    const countParams = [];
    let countIndex = 1;
    
    if (usuario_id) {
        countQuery += ` AND l.usuario_id = $${countIndex}`;
        countParams.push(usuario_id);
        countIndex++;
    }
    
    if (accion) {
        countQuery += ` AND l.accion = $${countIndex}`;
        countParams.push(accion);
        countIndex++;
    }
    
    if (fecha_desde) {
        countQuery += ` AND l.created_at >= $${countIndex}`;
        countParams.push(fecha_desde);
        countIndex++;
    }
    
    if (fecha_hasta) {
        countQuery += ` AND l.created_at <= $${countIndex}`;
        countParams.push(fecha_hasta);
        countIndex++;
    }
    
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    return {
        logs: result.rows,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/* ========================================================================== */
/*  BUSCAR LOGS POR USUARIO                                                   */
/* ========================================================================== */

const findByUserId = async (usuario_id, limit = 50) => {
    const result = await query(`
        SELECT 
            l.*,
            u.nombre as usuario_nombre
        FROM logs l
        LEFT JOIN users u ON l.usuario_id = u.id
        WHERE l.usuario_id = $1
        ORDER BY l.created_at DESC
        LIMIT $2
    `, [usuario_id, limit]);
    
    return result.rows;
};

/* ========================================================================== */
/*  BUSCAR LOGS POR TIPO DE ACCIÓN                                            */
/* ========================================================================== */

const findByAction = async (accion, limit = 100) => {
    const result = await query(`
        SELECT 
            l.*,
            u.nombre as usuario_nombre,
            u.email as usuario_email
        FROM logs l
        LEFT JOIN users u ON l.usuario_id = u.id
        WHERE l.accion = $1
        ORDER BY l.created_at DESC
        LIMIT $2
    `, [accion, limit]);
    
    return result.rows;
};

/* ========================================================================== */
/*  BUSCAR LOGS POR RANGO DE FECHAS                                           */
/* ========================================================================== */

const findByDateRange = async (startDate, endDate, limit = 100) => {
    const result = await query(`
        SELECT 
            l.*,
            u.nombre as usuario_nombre
        FROM logs l
        LEFT JOIN users u ON l.usuario_id = u.id
        WHERE l.created_at BETWEEN $1 AND $2
        ORDER BY l.created_at DESC
        LIMIT $3
    `, [startDate, endDate, limit]);
    
    return result.rows;
};

/* ========================================================================== */
/*  LIMPIAR LOGS ANTIGUOS                                                     */
/* ========================================================================== */

const cleanOldLogs = async (days = 90) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const result = await query(
        'DELETE FROM logs WHERE created_at < $1 RETURNING id',
        [cutoffDate]
    );
    
    return result.rows.length;
};

/* ========================================================================== */
/*  OBTENER ESTADÍSTICAS DE LOGS POR ACCIÓN                                   */
/* ========================================================================== */

const getStatsByAction = async (fecha_desde = null, fecha_hasta = null) => {
    let queryText = `
        SELECT 
            accion,
            COUNT(*) as total,
            COUNT(DISTINCT usuario_id) as usuarios_distintos
        FROM logs
        WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (fecha_desde) {
        queryText += ` AND created_at >= $${paramIndex}`;
        params.push(fecha_desde);
        paramIndex++;
    }
    
    if (fecha_hasta) {
        queryText += ` AND created_at <= $${paramIndex}`;
        params.push(fecha_hasta);
        paramIndex++;
    }
    
    queryText += ` GROUP BY accion ORDER BY total DESC`;
    
    const result = await query(queryText, params);
    return result.rows;
};

/* ========================================================================== */
/*  OBTENER LOGS RECIENTES                                                    */
/* ========================================================================== */

const getRecent = async (limit = 20) => {
    const result = await query(`
        SELECT 
            l.*,
            u.nombre as usuario_nombre,
            u.email as usuario_email
        FROM logs l
        LEFT JOIN users u ON l.usuario_id = u.id
        ORDER BY l.created_at DESC
        LIMIT $1
    `, [limit]);
    
    return result.rows;
};

/* ========================================================================== */
/*  ELIMINAR LOGS POR USUARIO                                                 */
/* ========================================================================== */

const deleteByUserId = async (usuario_id) => {
    const result = await query(
        'DELETE FROM logs WHERE usuario_id = $1 RETURNING id',
        [usuario_id]
    );
    
    return result.rows.length;
};

/* ========================================================================== */
/*  OBTENER TOTAL DE LOGS                                                     */
/* ========================================================================== */

const getTotalCount = async () => {
    const result = await query('SELECT COUNT(*) as total FROM logs');
    return parseInt(result.rows[0].total);
};

/* ========================================================================== */
/*  EXPORTAR MODELO                                                           */
/* ========================================================================== */

module.exports = {
    create,
    findById,
    findAll,
    findByUserId,
    findByAction,
    findByDateRange,
    cleanOldLogs,
    getStatsByAction,
    getRecent,
    deleteByUserId,
    getTotalCount
};