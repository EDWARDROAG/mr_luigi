// Archivo: User.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: User.js                                                       */
/*  📁 UBICACIÓN: backend/src/models/User.js                                  */
/*  🚀 MÓDULO: Modelos                                                        */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Modelo para la gestión de usuarios. Contiene métodos para crear, leer,   */
/*  actualizar y eliminar usuarios del sistema.                              */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Crear nuevo usuario (admin o cajero)                                   */
/*  ✅ Buscar usuario por email                                               */
/*  ✅ Buscar usuario por ID                                                  */
/*  ✅ Listar todos los usuarios                                              */
/*  ✅ Actualizar usuario                                                     */
/*  ✅ Eliminar usuario                                                       */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • bcrypt - Hash de contraseñas                                            */
/*  • database.js - Conexión a PostgreSQL                                     */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: authController, userController                           */
/*  • Relacionado con: Log (registra acciones)                                */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Las contraseñas se almacenan hasheadas con bcrypt                       */
/*  • Roles disponibles: 'admin', 'cajero'                                    */
/*  • El admin por defecto se crea con seed                                   */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Implementación CRUD completo                                       */
/*      ✅ Hash de contraseñas con bcrypt                                      */
/*                                                                            */
/* ========================================================================== */

const bcrypt = require('bcrypt');
const { query } = require('../config/database');

/* ========================================================================== */
/*  CREAR USUARIO                                                             */
/* ========================================================================== */

const create = async (userData) => {
    const { nombre, email, password, role } = userData;
    
    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const result = await query(
        `INSERT INTO users (nombre, email, password_hash, role, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id, nombre, email, role, created_at`,
        [nombre, email, hashedPassword, role]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  BUSCAR USUARIO POR EMAIL                                                  */
/* ========================================================================== */

const findByEmail = async (email) => {
    const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  BUSCAR USUARIO POR ID                                                     */
/* ========================================================================== */

const findById = async (id) => {
    const result = await query(
        'SELECT id, nombre, email, role, created_at FROM users WHERE id = $1',
        [id]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  LISTAR TODOS LOS USUARIOS                                                 */
/* ========================================================================== */

const findAll = async () => {
    const result = await query(
        'SELECT id, nombre, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    
    return result.rows;
};

/* ========================================================================== */
/*  ACTUALIZAR USUARIO                                                        */
/* ========================================================================== */

const update = async (id, userData) => {
    const { nombre, email, role, password } = userData;
    let queryText = 'UPDATE users SET ';
    const params = [];
    let paramIndex = 1;
    
    if (nombre) {
        queryText += `nombre = $${paramIndex}, `;
        params.push(nombre);
        paramIndex++;
    }
    
    if (email) {
        queryText += `email = $${paramIndex}, `;
        params.push(email);
        paramIndex++;
    }
    
    if (role) {
        queryText += `role = $${paramIndex}, `;
        params.push(role);
        paramIndex++;
    }
    
    if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        queryText += `password_hash = $${paramIndex}, `;
        params.push(hashedPassword);
        paramIndex++;
    }
    
    // Remover última coma y espacio
    queryText = queryText.slice(0, -2);
    queryText += ` WHERE id = $${paramIndex} RETURNING id, nombre, email, role`;
    params.push(id);
    
    const result = await query(queryText, params);
    return result.rows[0];
};

/* ========================================================================== */
/*  ELIMINAR USUARIO                                                          */
/* ========================================================================== */

const remove = async (id) => {
    const result = await query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  VERIFICAR CONTRASEÑA                                                      */
/* ========================================================================== */

const verifyPassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
    create,
    findByEmail,
    findById,
    findAll,
    update,
    remove,
    verifyPassword
};