// Archivo: hashPassword.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: hashPassword.js                                               */
/*  📁 UBICACIÓN: backend/src/utils/hashPassword.js                           */
/*  🚀 MÓDULO: Utilidades                                                     */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Utilidad para el hash y verificación de contraseñas usando bcrypt.       */
/*  Proporciona funciones seguras para almacenar contraseñas en la base      */
/*  de datos y validarlas durante el inicio de sesión.                       */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Generar hash de contraseña con salt automático                         */
/*  ✅ Verificar contraseña contra su hash                                    */
/*  ✅ Validar fortaleza de contraseña                                        */
/*  ✅ Generar contraseña aleatoria segura                                    */
/*  ✅ Configuración de rondas de salt (costo computacional)                  */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • bcrypt - Librería para hash de contraseñas                              */
/*  • crypto - Generación de contraseñas aleatorias                           */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: User Model, authController                               */
/*  • Usa: bcrypt para hash y comparación                                     */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • El número de rondas (saltRounds) afecta el tiempo de hash               */
/*  • 10 rondas es un buen balance entre seguridad y rendimiento              */
/*  • Las contraseñas nunca deben almacenarse en texto plano                  */
/*  • El hash generado incluye el salt automáticamente                        */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Hash de contraseñas                                                */
/*      ✅ Verificación de contraseñas                                        */
/*      ✅ Validación de fortaleza                                            */
/*      ✅ Generación de contraseñas aleatorias                               */
/*                                                                            */
/* ========================================================================== */

const bcrypt = require('bcrypt');
const crypto = require('crypto');

/* ========================================================================== */
/*  CONFIGURACIÓN                                                             */
/* ========================================================================== */

const SALT_ROUNDS = 10; // Número de rondas de salt (costo computacional)

/* ========================================================================== */
/*  GENERAR HASH DE CONTRASEÑA                                                */
/* ========================================================================== */

const hashPassword = async (password) => {
    if (!password || typeof password !== 'string') {
        throw new Error('La contraseña es requerida y debe ser un texto válido');
    }
    
    try {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    } catch (error) {
        console.error('Error al generar hash de contraseña:', error);
        throw new Error('Error al procesar la contraseña');
    }
};

/* ========================================================================== */
/*  VERIFICAR CONTRASEÑA                                                      */
/* ========================================================================== */

const verifyPassword = async (password, hashedPassword) => {
    if (!password || !hashedPassword) {
        return false;
    }
    
    try {
        const isValid = await bcrypt.compare(password, hashedPassword);
        return isValid;
    } catch (error) {
        console.error('Error al verificar contraseña:', error);
        return false;
    }
};

/* ========================================================================== */
/*  VALIDAR FORTALEZA DE CONTRASEÑA                                           */
/* ========================================================================== */

const validatePasswordStrength = (password) => {
    if (!password || typeof password !== 'string') {
        return {
            valid: false,
            message: 'La contraseña es requerida'
        };
    }
    
    const checks = {
        minLength: password.length >= 6,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumbers: /[0-9]/.test(password),
        hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const valid = checks.minLength;
    
    let message = '';
    if (!checks.minLength) {
        message = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    return {
        valid,
        message,
        checks
    };
};

/* ========================================================================== */
/*  GENERAR CONTRASEÑA ALEATORIA                                              */
/* ========================================================================== */

const generateRandomPassword = (length = 10) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let password = '';
    
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, charset.length);
        password += charset[randomIndex];
    }
    
    return password;
};

/* ========================================================================== */
/*  GENERAR CONTRASEÑA SEGURA (CON TODOS LOS REQUISITOS)                      */
/* ========================================================================== */

const generateSecurePassword = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()';
    
    let password = '';
    
    // Asegurar al menos un carácter de cada tipo
    password += upper[crypto.randomInt(0, upper.length)];
    password += lower[crypto.randomInt(0, lower.length)];
    password += numbers[crypto.randomInt(0, numbers.length)];
    password += special[crypto.randomInt(0, special.length)];
    
    // Completar con caracteres aleatorios hasta 10 caracteres
    const allChars = upper + lower + numbers + special;
    for (let i = password.length; i < 10; i++) {
        password += allChars[crypto.randomInt(0, allChars.length)];
    }
    
    // Mezclar la contraseña
    password = password.split('').sort(() => crypto.randomInt(0, 100) - 50).join('');
    
    return password;
};

/* ========================================================================== */
/*  HASH SINCRÓNICO (PARA SCRIPT DE INICIALIZACIÓN)                           */
/* ========================================================================== */

const hashPasswordSync = (password) => {
    if (!password || typeof password !== 'string') {
        throw new Error('La contraseña es requerida');
    }
    
    const salt = bcrypt.genSaltSync(SALT_ROUNDS);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
};

/* ========================================================================== */
/*  VERIFICAR SINCRÓNICO (PARA SCRIPT DE INICIALIZACIÓN)                      */
/* ========================================================================== */

const verifyPasswordSync = (password, hashedPassword) => {
    if (!password || !hashedPassword) {
        return false;
    }
    
    try {
        return bcrypt.compareSync(password, hashedPassword);
    } catch (error) {
        console.error('Error al verificar contraseña (sync):', error);
        return false;
    }
};

/* ========================================================================== */
/*  EXPORTAR FUNCIONES                                                        */
/* ========================================================================== */

module.exports = {
    hashPassword,
    verifyPassword,
    validatePasswordStrength,
    generateRandomPassword,
    generateSecurePassword,
    hashPasswordSync,
    verifyPasswordSync,
    SALT_ROUNDS
};