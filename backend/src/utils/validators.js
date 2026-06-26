// Archivo: validators.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: validators.js                                                 */
/*  📁 UBICACIÓN: backend/src/utils/validators.js                             */
/*  🚀 MÓDULO: Utilidades                                                     */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Utilidad para la validación de datos. Proporciona funciones reutilizables*/
/*  para validar correos electrónicos, contraseñas, teléfonos, documentos,   */
/*  URLs y otros formatos comunes.                                           */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Validación de correo electrónico                                        */
/*  ✅ Validación de contraseñas seguras                                      */
/*  ✅ Validación de números de teléfono (Colombia)                           */
/*  ✅ Validación de URLs                                                     */
/*  ✅ Validación de números de identificación (cédula, NIT)                  */
/*  ✅ Validación de precios y cantidades                                     */
/*  ✅ Validación de fechas                                                   */
/*  ✅ Validación de códigos de producto                                      */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • Ninguna (solo JavaScript nativo)                                        */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: validationMiddleware, modelos, controladores             */
/*  • Relacionado con: todas las validaciones del sistema                     */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Todas las funciones devuelven un objeto con { valid, message }         */
/*  • Los mensajes están en español para facilitar uso                       */
/*  • Las validaciones son modulares y reutilizables                          */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Validación de email                                                */
/*      ✅ Validación de contraseña                                           */
/*      ✅ Validación de teléfono                                             */
/*      ✅ Validación de URL                                                  */
/*      ✅ Validación de precios                                              */
/*      ✅ Validación de fechas                                               */
/*                                                                            */
/* ========================================================================== */

/* ========================================================================== */
/*  VALIDACIÓN DE CORREO ELECTRÓNICO                                          */
/* ========================================================================== */

/**
 * Valida un correo electrónico
 * @param {string} email - Correo a validar
 * @returns {Object} - { valid: boolean, message: string }
 */
const validateEmail = (email) => {
    if (!email || typeof email !== 'string') {
        return { valid: false, message: 'El correo electrónico es requerido' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        return { valid: false, message: 'Formato de correo electrónico inválido' };
    }
    
    // Validar longitud máxima
    if (email.length > 255) {
        return { valid: false, message: 'El correo electrónico no puede exceder 255 caracteres' };
    }
    
    return { valid: true, message: 'Correo electrónico válido' };
};

/* ========================================================================== */
/*  VALIDACIÓN DE CONTRASEÑA                                                  */
/* ========================================================================== */

/**
 * Valida una contraseña
 * @param {string} password - Contraseña a validar
 * @param {Object} options - Opciones de validación
 * @returns {Object} - { valid: boolean, message: string, checks: Object }
 */
const validatePassword = (password, options = {}) => {
    const defaults = {
        minLength: 6,
        maxLength: 100,
        requireUpperCase: false,
        requireLowerCase: false,
        requireNumbers: false,
        requireSpecialChars: false
    };
    
    const config = { ...defaults, ...options };
    
    if (!password || typeof password !== 'string') {
        return { valid: false, message: 'La contraseña es requerida', checks: {} };
    }
    
    const checks = {
        minLength: password.length >= config.minLength,
        maxLength: password.length <= config.maxLength,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumbers: /[0-9]/.test(password),
        hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    // Validar requisitos mínimos
    if (!checks.minLength) {
        return { valid: false, message: `La contraseña debe tener al menos ${config.minLength} caracteres`, checks };
    }
    
    if (!checks.maxLength) {
        return { valid: false, message: `La contraseña no puede exceder ${config.maxLength} caracteres`, checks };
    }
    
    if (config.requireUpperCase && !checks.hasUpperCase) {
        return { valid: false, message: 'La contraseña debe contener al menos una mayúscula', checks };
    }
    
    if (config.requireLowerCase && !checks.hasLowerCase) {
        return { valid: false, message: 'La contraseña debe contener al menos una minúscula', checks };
    }
    
    if (config.requireNumbers && !checks.hasNumbers) {
        return { valid: false, message: 'La contraseña debe contener al menos un número', checks };
    }
    
    if (config.requireSpecialChars && !checks.hasSpecialChars) {
        return { valid: false, message: 'La contraseña debe contener al menos un carácter especial', checks };
    }
    
    return { valid: true, message: 'Contraseña válida', checks };
};

/* ========================================================================== */
/*  VALIDACIÓN DE TELÉFONO (COLOMBIA)                                         */
/* ========================================================================== */

/**
 * Valida un número de teléfono colombiano
 * @param {string} phone - Número a validar
 * @returns {Object} - { valid: boolean, message: string, normalized: string }
 */
const validatePhone = (phone) => {
    if (!phone || typeof phone !== 'string') {
        return { valid: false, message: 'El número de teléfono es requerido', normalized: null };
    }
    
    // Limpiar número (eliminar espacios, guiones, paréntesis)
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // Validar formato (10 dígitos para celular/móvil o fijo)
    const cellRegex = /^3\d{9}$/; // Celular: 3 + 9 dígitos = 10
    const landlineRegex = /^[1-8]\d{9}$/; // Fijo: 1-8 + 9 dígitos = 10
    
    if (!cellRegex.test(cleaned) && !landlineRegex.test(cleaned)) {
        return { valid: false, message: 'Número de teléfono inválido (debe tener 10 dígitos)', normalized: null };
    }
    
    return { valid: true, message: 'Teléfono válido', normalized: cleaned };
};

/* ========================================================================== */
/*  VALIDACIÓN DE NÚMERO DE WHATSAPP                                          */
/* ========================================================================== */

/**
 * Valida un número de WhatsApp (incluye código de país)
 * @param {string} whatsapp - Número a validar
 * @returns {Object} - { valid: boolean, message: string, normalized: string }
 */
const validateWhatsApp = (whatsapp) => {
    if (!whatsapp || typeof whatsapp !== 'string') {
        return { valid: false, message: 'El número de WhatsApp es requerido', normalized: null };
    }
    
    // Limpiar número
    let cleaned = whatsapp.replace(/[\s\-\(\)\+]/g, '');
    
    // Validar formato (código país + 10 dígitos)
    // Colombia: 57 + 10 dígitos = 12
    const whatsappRegex = /^57\d{10}$/;
    
    if (!whatsappRegex.test(cleaned)) {
        return { valid: false, message: 'Número de WhatsApp inválido (debe incluir código de país 57)', normalized: null };
    }
    
    return { valid: true, message: 'WhatsApp válido', normalized: cleaned };
};

/* ========================================================================== */
/*  VALIDACIÓN DE URL                                                         */
/* ========================================================================== */

/**
 * Valida una URL
 * @param {string} url - URL a validar
 * @returns {Object} - { valid: boolean, message: string }
 */
const validateUrl = (url) => {
    if (!url) {
        return { valid: true, message: 'URL opcional' };
    }
    
    if (typeof url !== 'string') {
        return { valid: false, message: 'URL inválida' };
    }
    
    try {
        const urlObj = new URL(url);
        const validProtocols = ['http:', 'https:'];
        
        if (!validProtocols.includes(urlObj.protocol)) {
            return { valid: false, message: 'La URL debe usar http:// o https://' };
        }
        
        return { valid: true, message: 'URL válida' };
    } catch (error) {
        return { valid: false, message: 'Formato de URL inválido' };
    }
};

/* ========================================================================== */
/*  VALIDACIÓN DE NÚMERO DE IDENTIFICACIÓN                                    */
/* ========================================================================== */

/**
 * Valida un número de identificación (cédula, NIT, etc.)
 * @param {string} id - Número a validar
 * @param {string} type - Tipo de identificación (cedula, nit, passport)
 * @returns {Object} - { valid: boolean, message: string }
 */
validateIdNumber = (id, type = 'cedula') => {
    if (!id || typeof id !== 'string') {
        return { valid: false, message: 'El número de identificación es requerido' };
    }
    
    const cleaned = id.replace(/[\s\-\.]/g, '');
    
    switch (type) {
        case 'cedula':
            const cedulaRegex = /^\d{6,10}$/;
            if (!cedulaRegex.test(cleaned)) {
                return { valid: false, message: 'Cédula inválida (debe tener 6-10 dígitos)' };
            }
            break;
            
        case 'nit':
            const nitRegex = /^\d{9,12}$/;
            if (!nitRegex.test(cleaned)) {
                return { valid: false, message: 'NIT inválido (debe tener 9-12 dígitos)' };
            }
            break;
            
        case 'passport':
            const passportRegex = /^[A-Z0-9]{6,12}$/;
            if (!passportRegex.test(cleaned)) {
                return { valid: false, message: 'Pasaporte inválido (6-12 caracteres alfanuméricos)' };
            }
            break;
            
        default:
            return { valid: false, message: 'Tipo de identificación no soportado' };
    }
    
    return { valid: true, message: 'Identificación válida', normalized: cleaned };
};

/* ========================================================================== */
/*  VALIDACIÓN DE PRECIO                                                      */
/* ========================================================================== */

/**
 * Valida un precio
 * @param {number} price - Precio a validar
 * @returns {Object} - { valid: boolean, message: string }
 */
const validatePrice = (price) => {
    if (price === undefined || price === null) {
        return { valid: false, message: 'El precio es requerido' };
    }
    
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(numPrice)) {
        return { valid: false, message: 'El precio debe ser un número' };
    }
    
    if (numPrice < 0) {
        return { valid: false, message: 'El precio no puede ser negativo' };
    }
    
    if (numPrice > 999999999) {
        return { valid: false, message: 'El precio no puede exceder 999,999,999' };
    }
    
    return { valid: true, message: 'Precio válido', normalized: numPrice };
};

/* ========================================================================== */
/*  VALIDACIÓN DE CANTIDAD                                                    */
/* ========================================================================== */

/**
 * Valida una cantidad
 * @param {number} quantity - Cantidad a validar
 * @returns {Object} - { valid: boolean, message: string }
 */
const validateQuantity = (quantity) => {
    if (quantity === undefined || quantity === null) {
        return { valid: false, message: 'La cantidad es requerida' };
    }
    
    const numQuantity = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;
    
    if (isNaN(numQuantity)) {
        return { valid: false, message: 'La cantidad debe ser un número' };
    }
    
    if (!Number.isInteger(numQuantity)) {
        return { valid: false, message: 'La cantidad debe ser un número entero' };
    }
    
    if (numQuantity < 1) {
        return { valid: false, message: 'La cantidad debe ser al menos 1' };
    }
    
    if (numQuantity > 9999) {
        return { valid: false, message: 'La cantidad no puede exceder 9,999' };
    }
    
    return { valid: true, message: 'Cantidad válida', normalized: numQuantity };
};

/* ========================================================================== */
/*  VALIDACIÓN DE FECHA                                                       */
/* ========================================================================== */

/**
 * Valida una fecha
 * @param {string|Date} date - Fecha a validar
 * @returns {Object} - { valid: boolean, message: string, date: Date }
 */
const validateDate = (date) => {
    if (!date) {
        return { valid: false, message: 'La fecha es requerida', date: null };
    }
    
    const parsedDate = new Date(date);
    
    if (isNaN(parsedDate.getTime())) {
        return { valid: false, message: 'Fecha inválida', date: null };
    }
    
    return { valid: true, message: 'Fecha válida', date: parsedDate };
};

/* ========================================================================== */
/*  VALIDACIÓN DE CÓDIGO DE PRODUCTO                                          */
/* ========================================================================== */

/**
 * Valida un código de producto
 * @param {string} code - Código a validar
 * @returns {Object} - { valid: boolean, message: string }
 */
const validateProductCode = (code) => {
    if (!code || typeof code !== 'string') {
        return { valid: false, message: 'El código de producto es requerido' };
    }
    
    const codeRegex = /^[A-Z0-9\-_]{3,50}$/;
    
    if (!codeRegex.test(code)) {
        return { valid: false, message: 'Código inválido (solo letras mayúsculas, números, guiones y guiones bajos, 3-50 caracteres)' };
    }
    
    return { valid: true, message: 'Código válido', normalized: code.toUpperCase() };
};

/* ========================================================================== */
/*  EXPORTAR FUNCIONES                                                        */
/* ========================================================================== */

module.exports = {
    validateEmail,
    validatePassword,
    validatePhone,
    validateWhatsApp,
    validateUrl,
    validateIdNumber,
    validatePrice,
    validateQuantity,
    validateDate,
    validateProductCode
};