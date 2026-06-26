// Archivo: sharp.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: sharp.js                                                      */
/*  📁 UBICACIÓN: backend/src/config/sharp.js                                 */
/*  🚀 MÓDULO: Configuración                                                  */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Configuración centralizada de Sharp para la optimización de imágenes.    */
/*  Define tamaños, calidades, formatos y opciones de procesamiento para     */
/*  diferentes tipos de imágenes (productos, comprobantes, thumbnails).      */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Configuración de tamaños para diferentes usos                          */
/*  ✅ Configuración de calidad por tipo de imagen                            */
/*  ✅ Formatos de salida configurables                                       */
/*  ✅ Opciones de redimensionamiento                                         */
/*  ✅ Configuración de metadatos                                             */
/*  ✅ Presets predefinidos para casos comunes                                */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • Ninguna (solo exporta configuración)                                    */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: imageOptimizer.js                                        */
/*  • Usa: sharp para procesamiento                                           */
/*  • Relacionado con: multer.js                                              */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Los productos se redimensionan a 800px de ancho máximo                  */
/*  • Las thumbnails son cuadradas de 150x150                                 */
/*  • Los comprobantes solo se comprimen sin redimensionar                    */
/*  • Calidad por defecto: 80% para balance calidad/tamaño                    */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Configuración de tamaños                                           */
/*      ✅ Presets por tipo de imagen                                         */
/*      ✅ Opciones de formato                                                */
/*      ✅ Configuración de calidad                                           */
/*                                                                            */
/* ========================================================================== */

/* ========================================================================== */
/*  CONFIGURACIÓN DE TAMAÑOS                                                  */
/* ========================================================================== */

const SIZES = {
    // Thumbnail para listados (cuadrado)
    THUMBNAIL: {
        width: 150,
        height: 150,
        fit: 'cover',
        position: 'center'
    },
    
    // Tamaño pequeño para tarjetas
    SMALL: {
        width: 300,
        height: null,
        fit: 'inside'
    },
    
    // Tamaño mediano para detalles
    MEDIUM: {
        width: 500,
        height: null,
        fit: 'inside'
    },
    
    // Tamaño grande para vista completa
    LARGE: {
        width: 800,
        height: null,
        fit: 'inside'
    },
    
    // Tamaño extra grande para zoom (opcional)
    EXTRA_LARGE: {
        width: 1200,
        height: null,
        fit: 'inside'
    },
    
    // Banner para promociones
    BANNER: {
        width: 1200,
        height: 400,
        fit: 'cover'
    }
};

/* ========================================================================== */
/*  CONFIGURACIÓN DE CALIDAD                                                  */
/* ========================================================================== */

const QUALITY = {
    // Productos (balance entre calidad y tamaño)
    PRODUCT: 80,
    
    // Thumbnails (puede ser menor)
    THUMBNAIL: 70,
    
    // Comprobantes (priorizar legibilidad)
    RECEIPT: 85,
    
    // Banners (alta calidad)
    BANNER: 90,
    
    // Por defecto
    DEFAULT: 80
};

/* ========================================================================== */
/*  CONFIGURACIÓN DE FORMATOS                                                 */
/* ========================================================================== */

const FORMATS = {
    // Formato principal para productos (WebP es más eficiente)
    PRODUCT: 'webp',
    
    // Formato para thumbnails
    THUMBNAIL: 'webp',
    
    // Formato para comprobantes (JPEG para compatibilidad)
    RECEIPT: 'jpeg',
    
    // Formato para banners
    BANNER: 'webp',
    
    // Formato por defecto
    DEFAULT: 'webp'
};

/* ========================================================================== */
/*  OPCIONES DE PROCESAMIENTO                                                 */
/* ========================================================================== */

const PROCESSING_OPTIONS = {
    // Eliminar metadatos (EXIF, etc.) para reducir tamaño
    stripMetadata: true,
    
    // Nivel de progreso de compresión (1-9, 6 es balance)
    compressionLevel: 6,
    
    // Habilitar optimización de paleta de colores (para PNG)
    palette: true,
    
    // Colores máximos en paleta (para PNG)
    colors: 256,
    
    // Reducción de ruido (0-100)
    noiseReduction: 0,
    
    // Enfoque adaptativo
    adaptiveFiltering: false
};

/* ========================================================================== */
/*  PRESETS POR TIPO DE IMAGEN                                                */
/* ========================================================================== */

/**
 * Presets predefinidos para diferentes tipos de imágenes
 */
const PRESETS = {
    /**
     * Preset para imágenes de productos
     */
    PRODUCT: {
        size: SIZES.LARGE,
        quality: QUALITY.PRODUCT,
        format: FORMATS.PRODUCT,
        options: {
            stripMetadata: true,
            compressionLevel: 6
        }
    },
    
    /**
     * Preset para thumbnails de productos
     */
    PRODUCT_THUMBNAIL: {
        size: SIZES.THUMBNAIL,
        quality: QUALITY.THUMBNAIL,
        format: FORMATS.THUMBNAIL,
        options: {
            stripMetadata: true,
            compressionLevel: 7
        }
    },
    
    /**
     * Preset para comprobantes de pago
     */
    RECEIPT: {
        size: null, // No redimensionar
        quality: QUALITY.RECEIPT,
        format: FORMATS.RECEIPT,
        options: {
            stripMetadata: false, // Mantener metadatos para auditoría
            compressionLevel: 5
        }
    },
    
    /**
     * Preset para banners promocionales
     */
    BANNER: {
        size: SIZES.BANNER,
        quality: QUALITY.BANNER,
        format: FORMATS.BANNER,
        options: {
            stripMetadata: true,
            compressionLevel: 8
        }
    },
    
    /**
     * Preset para imágenes de perfil
     */
    PROFILE: {
        size: SIZES.SMALL,
        quality: QUALITY.PRODUCT,
        format: FORMATS.PRODUCT,
        options: {
            stripMetadata: true,
            compressionLevel: 6
        }
    }
};

/* ========================================================================== */
/*  FUNCIONES DE RESOLUCIÓN DE PRESETS                                        */
/* ========================================================================== */

/**
 * Obtiene la configuración para un tipo de imagen
 * @param {string} type - Tipo de imagen (product, receipt, thumbnail, banner)
 * @returns {Object} - Configuración del preset
 */
const getPreset = (type) => {
    const preset = PRESETS[type.toUpperCase()];
    if (!preset) {
        return PRESETS.PRODUCT;
    }
    return preset;
};

/**
 * Obtiene la configuración de tamaño para un tipo específico
 * @param {string} sizeName - Nombre del tamaño (thumbnail, small, medium, large, extra_large, banner)
 * @returns {Object} - Configuración de tamaño
 */
const getSize = (sizeName) => {
    const size = SIZES[sizeName.toUpperCase()];
    if (!size) {
        return SIZES.LARGE;
    }
    return size;
};

/**
 * Obtiene la calidad para un tipo de imagen
 * @param {string} type - Tipo de imagen
 * @returns {number} - Calidad (0-100)
 */
const getQuality = (type) => {
    const quality = QUALITY[type.toUpperCase()];
    if (!quality) {
        return QUALITY.DEFAULT;
    }
    return quality;
};

/**
 * Obtiene el formato para un tipo de imagen
 * @param {string} type - Tipo de imagen
 * @returns {string} - Formato (webp, jpeg, png)
 */
const getFormat = (type) => {
    const format = FORMATS[type.toUpperCase()];
    if (!format) {
        return FORMATS.DEFAULT;
    }
    return format;
};

/* ========================================================================== */
/*  CONFIGURACIÓN DE METADATOS                                                */
/* ========================================================================== */

const METADATA_CONFIG = {
    // Mantener solo estos campos EXIF (si stripMetadata es false)
    keepExif: ['Orientation', 'DateTime', 'GPSLatitude', 'GPSLongitude'],
    
    // Agregar metadatos personalizados
    customMetadata: {
        software: 'CoreX Image Optimizer',
        version: '1.0.0'
    }
};

/* ========================================================================== */
/*  OPCIONES DE CONVERSIÓN                                                    */
/* ========================================================================== */

const CONVERSION_OPTIONS = {
    // Opciones para WebP
    webp: {
        quality: QUALITY.DEFAULT,
        alphaQuality: 80,
        lossless: false,
        nearLossless: false,
        smartSubsample: true,
        effort: 4
    },
    
    // Opciones para JPEG
    jpeg: {
        quality: QUALITY.DEFAULT,
        progressive: true,
        chromaSubsampling: '4:2:0',
        trellisQuantisation: true,
        overshootDeringing: true,
        optimiseScans: true
    },
    
    // Opciones para PNG
    png: {
        quality: QUALITY.DEFAULT,
        compressionLevel: 6,
        palette: true,
        colors: 256,
        dither: 1.0
    }
};

/* ========================================================================== */
/*  EXPORTAR CONFIGURACIÓN                                                    */
/* ========================================================================== */

module.exports = {
    // Configuraciones principales
    SIZES,
    QUALITY,
    FORMATS,
    PROCESSING_OPTIONS,
    PRESETS,
    METADATA_CONFIG,
    CONVERSION_OPTIONS,
    
    // Funciones de resolución
    getPreset,
    getSize,
    getQuality,
    getFormat,
    
    // Constantes útiles
    MAX_WIDTH: SIZES.EXTRA_LARGE.width,
    MAX_HEIGHT: SIZES.EXTRA_LARGE.height || 1200
};