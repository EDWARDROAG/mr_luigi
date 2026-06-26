// Archivo: comparePassword.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: comparePassword.js                                            */
/*  📁 UBICACIÓN: backend/src/utils/comparePassword.js                        */
/*  🚀 MÓDULO: Utilidades                                                     */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Utilidad especializada para la comparación segura de contraseñas usando  */
/*  bcrypt. Proporciona funciones específicas para verificar contraseñas     */
/*  durante el proceso de autenticación y cambio de contraseña.              */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Comparar contraseña en texto plano con hash almacenado                 */
/*  ✅ Comparación asíncrona con manejo de errores                            */
/*  ✅ Comparación síncrona para scripts                                      */
/*  ✅ Validación de parámetros antes de comparar                             */
/*  ✅ Logging de intentos fallidos (opcional)                                */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • bcrypt - Librería para comparación de contraseñas                       */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: authController, User Model                               */
/*  • Complementa a hashPassword.js                                           */
/*  • Usa la misma configuración de bcrypt                                    */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Esta función es resistente a ataques de timing                          */
/*  • No revela información sobre por qué falló la comparación               */
/*  • Siempre usar versión asíncrona en producción                            */
/*  • La versión síncrona es solo para scripts de inicialización             */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Comparación asíncrona                                              */
/*      ✅ Comparación síncrona                                               */
/*      ✅ Validación de parámetros                                           */
/*      ✅ Funciones auxiliares                                               */
/*                                                                            */
/* ========================================================================== */

const bcrypt = require('bcrypt');

/* ========================================================================== */
/*  CONFIGURACIÓN                                                             */
/* ========================================================================== */

const SALT_ROUNDS = 10; // Mismo valor que en hashPassword.js

/* ========================================================================== */
/*  COMPARAR CONTRASEÑA (ASÍNCRONA)                                           */
/* ========================================================================== */

/**
 * Compara una contraseña en texto plano con su hash almacenado
 * @param {string} plainPassword - Contraseña en texto plano
 * @param {string} hashedPassword - Hash almacenado en la base de datos
 * @returns {Promise<boolean>} - true si coinciden, false en caso contrario
 */
const comparePassword = async (plainPassword, hashedPassword) => {
    // Validar parámetros
    if (!plainPassword || typeof plainPassword !== 'string') {
        console.error('comparePassword: Contraseña en texto plano inválida');
        return false;
    }
    
    if (!hashedPassword || typeof hashedPassword !== 'string') {
        console.error('comparePassword: Hash de contraseña inválido');
        return false;
    }
    
    try {
        const isValid = await bcrypt.compare(plainPassword, hashedPassword);
        return isValid;
    } catch (error) {
        console.error('Error en comparePassword:', error.message);
        return false;
    }
};

/* ========================================================================== */
/*  COMPARAR CONTRASEÑA CON LOGGING                                           */
/* ========================================================================== */

/**
 * Compara contraseñas y registra intentos fallidos (útil para auditoría)
 * @param {string} plainPassword - Contraseña en texto plano
 * @param {string} hashedPassword - Hash almacenado
 * @param {object} context - Información de contexto (usuario, IP, etc.)
 * @returns {Promise<{success: boolean, message: string}>}
 */
const comparePasswordWithLogging = async (plainPassword, hashedPassword, context = {}) => {
    if (!plainPassword || !hashedPassword) {
        return {
            success: false,
            message: 'Parámetros inválidos para comparación'
        };
    }
    
    try {
        const isValid = await bcrypt.compare(plainPassword, hashedPassword);
        
        if (!isValid) {
            // Registrar intento fallido (el consumidor puede manejar el log)
            console.warn(`Intento de autenticación fallido para usuario: ${context.email || 'desconocido'}`);
        }
        
        return {
            success: isValid,
            message: isValid ? 'Contraseña correcta' : 'Contraseña incorrecta'
        };
    } catch (error) {
        console.error('Error en comparePasswordWithLogging:', error.message);
        return {
            success: false,
            message: 'Error al verificar la contraseña'
        };
    }
};

/* ========================================================================== */
/*  COMPARAR CONTRASEÑA (SÍNCRONA)                                            */
/* ========================================================================== */

/**
 * Versión síncrona de comparación (solo para scripts y pruebas)
 * @param {string} plainPassword - Contraseña en texto plano
 * @param {string} hashedPassword - Hash almacenado
 * @returns {boolean} - true si coinciden, false en caso contrario
 */
const comparePasswordSync = (plainPassword, hashedPassword) => {
    if (!plainPassword || !hashedPassword) {
        return false;
    }
    
    try {
        return bcrypt.compareSync(plainPassword, hashedPassword);
    } catch (error) {
        console.error('Error en comparePasswordSync:', error.message);
        return false;
    }
};

/* ========================================================================== */
/*  VERIFICAR MÚLTIPLES INTENTOS                                              */
/* ========================================================================== */

/**
 * Verifica si una contraseña coincide con alguno de múltiples hashes
 * Útil para migraciones o cuando hay múltiples formatos de hash
 * @param {string} plainPassword - Contraseña en texto plano
 * @param {string[]} hashedPasswords - Array de hashes a comparar
 * @returns {Promise<{success: boolean, index: number}>}
 */
const compareWithMultipleHashes = async (plainPassword, hashedPasswords) => {
    if (!plainPassword || !hashedPasswords || !Array.isArray(hashedPasswords)) {
        return { success: false, index: -1 };
    }
    
    for (let i = 0; i < hashedPasswords.length; i++) {
        const isValid = await comparePassword(plainPassword, hashedPasswords[i]);
        if (isValid) {
            return { success: true, index: i };
        }
    }
    
    return { success: false, index: -1 };
};

/* ========================================================================== */
/*  VALIDAR FORMATO DE HASH                                                   */
/* ========================================================================== */

/**
 * Valida si una cadena tiene formato de hash bcrypt válido
 * @param {string} hash - Posible hash bcrypt
 * @returns {boolean} - true si es un hash bcrypt válido
 */
const isValidBcryptHash = (hash) => {
    if (!hash || typeof hash !== 'string') {
        return false;
    }
    
    // El formato bcrypt comienza con $2b$, $2a$ o $2y$ seguido de $ y 2 dígitos
    // Ejemplo: $2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789
    const bcryptRegex = /^\$2[aby]\$\d+\$[./A-Za-z0-9]{53}$/;
    return bcryptRegex.test(hash);
};

/* ========================================================================== */
/*  EXPORTAR FUNCIONES                                                        */
/* ========================================================================== */

module.exports = {
    comparePassword,
    comparePasswordWithLogging,
    comparePasswordSync,
    compareWithMultipleHashes,
    isValidBcryptHash
};