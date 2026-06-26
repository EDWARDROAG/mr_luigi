// Archivo: whatsappLink.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: whatsappLink.js                                               */
/*  📁 UBICACIÓN: backend/src/utils/whatsappLink.js                           */
/*  🚀 MÓDULO: Utilidades                                                     */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Utilidad para la generación de enlaces de WhatsApp. Permite crear        */
/*  enlaces personalizados para comunicación directa con clientes,           */
/*  incluyendo mensajes predefinidos con información de productos.           */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Generar enlace de WhatsApp con número personalizado                    */
/*  ✅ Crear mensajes predefinidos para productos                             */
/*  ✅ Sanitizar texto para URL                                               */
/*  ✅ Generar enlace de compra rápida                                        */
/*  ✅ Generar enlace de consulta general                                     */
/*  ✅ Validar números de teléfono                                            */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • Ninguna (solo JavaScript nativo)                                        */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: productController, frontend                              */
/*  • Relacionado con: Product model                                          */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • El número debe incluir código de país (ej: 573115610825)               */
/*  • No se requieren signos + o espacios                                     */
/*  • Los mensajes se codifican automáticamente para URL                      */
/*  • El enlace abre WhatsApp Web o la aplicación móvil                       */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Generación de enlaces básicos                                       */
/*      ✅ Mensajes predefinidos                                              */
/*      ✅ Sanitización de texto                                              */
/*      ✅ Validación de teléfonos                                            */
/*                                                                            */
/* ========================================================================== */

/* ========================================================================== */
/*  CONFIGURACIÓN                                                             */
/* ========================================================================== */

// Número de WhatsApp por defecto (CoreX)
const DEFAULT_WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '573115610825';

/* ========================================================================== */
/*  SANITIZAR TEXTO PARA URL                                                  */
/* ========================================================================== */

/**
 * Sanitiza un texto para ser utilizado en una URL
 * @param {string} text - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
const sanitizeText = (text) => {
    if (!text || typeof text !== 'string') {
        return '';
    }
    
    // Eliminar caracteres especiales y reemplazar espacios
    let sanitized = text
        .trim()
        .replace(/[^\w\s\u00C0-\u00FFáéíóúñÑ]/g, ' ') // Permitir acentos y ñ
        .replace(/\s+/g, ' ')
        .trim();
    
    // Codificar para URL
    return encodeURIComponent(sanitized);
};

/* ========================================================================== */
/*  VALIDAR NÚMERO DE WHATSAPP                                                */
/* ========================================================================== */

/**
 * Valida si un número de teléfono es válido para WhatsApp
 * @param {string} phoneNumber - Número a validar
 * @returns {boolean} - true si es válido
 */
const isValidWhatsAppNumber = (phoneNumber) => {
    if (!phoneNumber || typeof phoneNumber !== 'string') {
        return false;
    }
    
    // Limpiar número (eliminar +, espacios, guiones)
    const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
    
    // Validar formato: código de país + 10 dígitos aproximados
    // Colombia: 57 + 10 dígitos (total 12)
    // Puede ser 10-15 dígitos en total
    return cleanNumber.length >= 10 && cleanNumber.length <= 15;
};

/* ========================================================================== */
/*  LIMPIAR NÚMERO DE TELÉFONO                                                */
/* ========================================================================== */

/**
 * Limpia un número de teléfono para uso en enlace de WhatsApp
 * @param {string} phoneNumber - Número a limpiar
 * @returns {string} - Número limpio (solo dígitos)
 */
const cleanPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) {
        return DEFAULT_WHATSAPP_NUMBER;
    }
    
    // Eliminar todo excepto dígitos
    let cleaned = phoneNumber.toString().replace(/[^\d]/g, '');
    
    // Eliminar el '+' si está presente (ya lo quitó la expresión regular)
    // Si el número comienza con 00, reemplazar con el código de país
    if (cleaned.startsWith('00')) {
        cleaned = cleaned.substring(2);
    }
    
    // Si el número no tiene código de país, asumir Colombia (57)
    if (cleaned.length === 10) {
        cleaned = '57' + cleaned;
    }
    
    return cleaned;
};

/* ========================================================================== */
/*  GENERAR ENLACE DE WHATSAPP                                                */
/* ========================================================================== */

/**
 * Genera un enlace de WhatsApp con mensaje personalizado
 * @param {string} phoneNumber - Número de teléfono (opcional, usa el default si no se provee)
 * @param {string} message - Mensaje a enviar
 * @returns {string} - URL de WhatsApp
 */
const generateWhatsAppLink = (phoneNumber = null, message = '') => {
    const number = cleanPhoneNumber(phoneNumber || DEFAULT_WHATSAPP_NUMBER);
    const cleanMessage = sanitizeText(message);
    
    if (cleanMessage) {
        return `https://wa.me/${number}?text=${cleanMessage}`;
    }
    
    return `https://wa.me/${number}`;
};

/* ========================================================================== */
/*  GENERAR ENLACE DE CONSULTA DE PRODUCTO                                    */
/* ========================================================================== */

/**
 * Genera un enlace de WhatsApp para consultar un producto específico
 * @param {Object} product - Producto con nombre y precio
 * @param {string} phoneNumber - Número de teléfono (opcional)
 * @returns {string} - URL de WhatsApp
 */
const generateProductInquiryLink = (product, phoneNumber = null) => {
    if (!product || !product.nombre) {
        return generateWhatsAppLink(phoneNumber, 'Hola, estoy interesado en sus productos.');
    }
    
    const message = `Hola, estoy interesado en el producto: ${product.nombre}${product.precio ? ` ($${product.precio.toLocaleString('es-CO')})` : ''}. ¿Podría darme más información?`;
    
    return generateWhatsAppLink(phoneNumber, message);
};

/* ========================================================================== */
/*  GENERAR ENLACE DE COMPRA RÁPIDA                                           */
/* ========================================================================== */

/**
 * Genera un enlace de WhatsApp para compra rápida de un producto
 * @param {Object} product - Producto con nombre y precio
 * @param {string} phoneNumber - Número de teléfono (opcional)
 * @returns {string} - URL de WhatsApp
 */
const generateQuickBuyLink = (product, phoneNumber = null) => {
    if (!product || !product.nombre) {
        return generateWhatsAppLink(phoneNumber, 'Hola, quiero comprar un producto.');
    }
    
    const message = `Hola, quiero COMPRAR: ${product.nombre}${product.precio ? ` - Precio: $${product.precio.toLocaleString('es-CO')}` : ''}. ¿Tiene stock disponible?`;
    
    return generateWhatsAppLink(phoneNumber, message);
};

/* ========================================================================== */
/*  GENERAR ENLACE DE CONSULTA DE SERVICIO                                    */
/* ========================================================================== */

/**
 * Genera un enlace de WhatsApp para consultar un servicio de mantenimiento
 * @param {string} serviceType - Tipo de servicio (celulares, computadores, laptops, impresoras)
 * @param {string} phoneNumber - Número de teléfono (opcional)
 * @returns {string} - URL de WhatsApp
 */
const generateServiceInquiryLink = (serviceType, phoneNumber = null) => {
    const serviceMap = {
        'celulares': 'mantenimiento de celulares',
        'computadores': 'mantenimiento de computadores',
        'laptops': 'mantenimiento de laptops',
        'impresoras': 'mantenimiento de impresoras'
    };
    
    const serviceName = serviceMap[serviceType] || serviceType;
    const message = `Hola, necesito información sobre el servicio de ${serviceName}. ¿Cuál es el costo y la disponibilidad?`;
    
    return generateWhatsAppLink(phoneNumber, message);
};

/* ========================================================================== */
/*  GENERAR ENLACE DE CONSULTA GENERAL                                        */
/* ========================================================================== */

/**
 * Genera un enlace de WhatsApp para consulta general
 * @param {string} phoneNumber - Número de teléfono (opcional)
 * @returns {string} - URL de WhatsApp
 */
const generateGeneralInquiryLink = (phoneNumber = null) => {
    const message = 'Hola, vi su página web CoreX y me gustaría recibir más información sobre sus productos y servicios.';
    
    return generateWhatsAppLink(phoneNumber, message);
};

/* ========================================================================== */
/*  GENERAR ENLACE CON MÚLTIPLES PRODUCTOS                                    */
/* ========================================================================== */

/**
 * Genera un enlace de WhatsApp con múltiples productos en el mensaje
 * @param {Array} products - Array de productos
 * @param {string} phoneNumber - Número de teléfono (opcional)
 * @returns {string} - URL de WhatsApp
 */
const generateMultipleProductsLink = (products, phoneNumber = null) => {
    if (!products || products.length === 0) {
        return generateGeneralInquiryLink(phoneNumber);
    }
    
    let message = 'Hola, estoy interesado en los siguientes productos:\n\n';
    
    products.forEach((product, index) => {
        message += `${index + 1}. ${product.nombre}`;
        if (product.precio) {
            message += ` - $${product.precio.toLocaleString('es-CO')}`;
        }
        message += '\n';
    });
    
    message += '\n¿Podría confirmar disponibilidad y precios actualizados?';
    
    return generateWhatsAppLink(phoneNumber, message);
};

/* ========================================================================== */
/*  OBTENER NÚMERO POR DEFECTO                                                */
/* ========================================================================== */

/**
 * Obtiene el número de WhatsApp por defecto configurado
 * @returns {string} - Número de WhatsApp por defecto
 */
const getDefaultWhatsAppNumber = () => {
    return DEFAULT_WHATSAPP_NUMBER;
};

/* ========================================================================== */
/*  EXPORTAR FUNCIONES                                                        */
/* ========================================================================== */

module.exports = {
    generateWhatsAppLink,
    generateProductInquiryLink,
    generateQuickBuyLink,
    generateServiceInquiryLink,
    generateGeneralInquiryLink,
    generateMultipleProductsLink,
    isValidWhatsAppNumber,
    cleanPhoneNumber,
    sanitizeText,
    getDefaultWhatsAppNumber
};