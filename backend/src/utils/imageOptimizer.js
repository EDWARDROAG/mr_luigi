// Archivo: imageOptimizer.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: imageOptimizer.js                                             */
/*  📁 UBICACIÓN: backend/src/utils/imageOptimizer.js                         */
/*  🚀 MÓDULO: Utilidades                                                     */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Utilidad para la optimización de imágenes subidas al sistema.            */
/*  Redimensiona, comprime y optimiza imágenes para mejorar el rendimiento   */
/*  y reducir el uso de almacenamiento y ancho de banda.                     */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Redimensionar imágenes a tamaños estándar                              */
/*  ✅ Comprimir imágenes manteniendo calidad aceptable                       */
/*  ✅ Convertir formatos a WebP para mejor compresión                        */
/*  ✅ Generar múltiples tamaños (thumbnail, medium, large)                   */
/*  ✅ Eliminar imágenes del servidor                                         */
/*  ✅ Validar tipos y tamaños de imagen                                      */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • sharp - Biblioteca de optimización de imágenes                          */
/*  • fs - Manejo de archivos                                                 */
/*  • path - Manejo de rutas                                                  */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: productController, uploadController                      */
/*  • Usa: sharp para procesamiento                                          */
/*  • Relacionado con: uploadMiddleware                                       */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Las imágenes se redimensionan a un ancho máximo de 800px                */
/*  • La calidad se ajusta a 80% para balance entre calidad y tamaño         */
/*  • Las imágenes se convierten a WebP por defecto                          */
/*  • Las imágenes originales se eliminan después de optimizar                */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Optimización básica                                                */
/*      ✅ Redimensionamiento                                                 */
/*      ✅ Eliminación de imágenes                                            */
/*      ✅ Soporte para múltiples tamaños                                      */
/*                                                                            */
/* ========================================================================== */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/* ========================================================================== */
/*  CONFIGURACIÓN                                                             */
/* ========================================================================== */

const CONFIG = {
    // Tamaños de imagen
    SIZES: {
        THUMBNAIL: { width: 150, height: 150, fit: 'cover' },
        MEDIUM: { width: 400, height: 400, fit: 'inside' },
        LARGE: { width: 800, height: 800, fit: 'inside' }
    },
    // Calidad de compresión (1-100)
    QUALITY: 80,
    // Formato de salida
    OUTPUT_FORMAT: 'webp',
    // Tamaño máximo de archivo original (5MB)
    MAX_FILE_SIZE: 5 * 1024 * 1024
};

/* ========================================================================== */
/*  OPTIMIZAR IMAGEN                                                          */
/* ========================================================================== */

/**
 * Optimiza una imagen subida: redimensiona, comprime y convierte a WebP
 * @param {Object} file - Archivo subido por multer
 * @param {string} folder - Carpeta destino ('productos' o 'comprobantes')
 * @returns {Promise<string>} - Ruta de la imagen optimizada
 */
const optimizeImage = async (file, folder = 'productos') => {
    if (!file || !file.path) {
        throw new Error('Archivo no válido para optimizar');
    }
    
    const outputDir = path.join(__dirname, '../../uploads', folder);
    const outputFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${CONFIG.OUTPUT_FORMAT}`;
    const outputPath = path.join(outputDir, outputFilename);
    
    try {
        // Verificar que el directorio existe
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Procesar imagen con sharp
        await sharp(file.path)
            .resize(CONFIG.SIZES.LARGE.width, CONFIG.SIZES.LARGE.height, {
                fit: CONFIG.SIZES.LARGE.fit,
                withoutEnlargement: true
            })
            .webp({ quality: CONFIG.QUALITY })
            .toFile(outputPath);
        
        // Eliminar archivo original
        fs.unlinkSync(file.path);
        
        return `/uploads/${folder}/${outputFilename}`;
    } catch (error) {
        console.error('Error al optimizar imagen:', error);
        
        // Si falla, intentar mantener el archivo original
        if (fs.existsSync(file.path)) {
            const originalExt = path.extname(file.path);
            const fallbackFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${originalExt}`;
            const originalOutputPath = path.join(outputDir, fallbackFilename);
            fs.renameSync(file.path, originalOutputPath);
            return `/uploads/${folder}/${fallbackFilename}`;
        }
        
        throw new Error('No se pudo procesar la imagen');
    }
};

/* ========================================================================== */
/*  OPTIMIZAR IMAGEN CON MÚLTIPLES TAMAÑOS                                    */
/* ========================================================================== */

/**
 * Optimiza una imagen y genera múltiples tamaños (thumbnail, medium, large)
 * @param {Object} file - Archivo subido por multer
 * @param {string} folder - Carpeta destino
 * @returns {Promise<Object>} - Objeto con rutas de todos los tamaños
 */
const optimizeImageWithSizes = async (file, folder = 'productos') => {
    if (!file || !file.path) {
        throw new Error('Archivo no válido para optimizar');
    }
    
    const outputDir = path.join(__dirname, '../../uploads', folder);
    const baseName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const result = {};
    
    try {
        // Verificar que el directorio existe
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Leer imagen original
        const image = sharp(file.path);
        const metadata = await image.metadata();
        
        // Generar cada tamaño
        for (const [sizeName, sizeConfig] of Object.entries(CONFIG.SIZES)) {
            const outputFilename = `${baseName}_${sizeName.toLowerCase()}.${CONFIG.OUTPUT_FORMAT}`;
            const outputPath = path.join(outputDir, outputFilename);
            
            let resizeOptions = {
                width: sizeConfig.width,
                height: sizeConfig.height,
                fit: sizeConfig.fit,
                withoutEnlargement: true
            };
            
            // Para tamaño large, mantener proporción
            if (sizeName === 'LARGE') {
                resizeOptions = {
                    width: sizeConfig.width,
                    withoutEnlargement: true
                };
            }
            
            await sharp(file.path)
                .resize(resizeOptions)
                .webp({ quality: CONFIG.QUALITY })
                .toFile(outputPath);
            
            result[sizeName.toLowerCase()] = {
                path: outputPath,
                url: `/uploads/${folder}/${outputFilename}`,
                width: sizeConfig.width,
                height: sizeConfig.height
            };
        }
        
        // Eliminar archivo original
        fs.unlinkSync(file.path);
        
        return result;
    } catch (error) {
        console.error('Error al optimizar imagen con múltiples tamaños:', error);
        
        // Si falla, intentar optimización simple
        try {
            const simplePath = await optimizeImage(file, folder);
            return {
                simple: {
                    path: simplePath,
                    url: `/uploads/${folder}/${path.basename(simplePath)}`
                }
            };
        } catch (fallbackError) {
            throw new Error('No se pudo procesar la imagen');
        }
    }
};

/* ========================================================================== */
/*  ELIMINAR IMAGEN                                                           */
/* ========================================================================== */

/**
 * Elimina una imagen del servidor
 * @param {string} imageUrl - URL o ruta de la imagen
 * @returns {Promise<boolean>} - true si se eliminó, false si no existía
 */
const deleteImage = async (imageUrl) => {
    if (!imageUrl) {
        return false;
    }
    
    try {
        // Extraer ruta del archivo desde la URL
        let filePath;
        
        if (imageUrl.startsWith('/uploads/')) {
            filePath = path.join(__dirname, '../../', imageUrl);
        } else if (imageUrl.startsWith('http')) {
            // Si es URL completa, extraer la parte de la ruta
            const urlPath = new URL(imageUrl).pathname;
            filePath = path.join(__dirname, '../../', urlPath);
        } else {
            filePath = imageUrl;
        }
        
        // Verificar si el archivo existe
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            
            // También eliminar versiones adicionales si existen (thumbnail, medium)
            const dir = path.dirname(filePath);
            const basename = path.basename(filePath, path.extname(filePath));
            const baseNameWithoutSize = basename.replace(/_(thumbnail|medium|large)$/, '');
            
            const files = fs.readdirSync(dir);
            for (const file of files) {
                if (file.startsWith(baseNameWithoutSize) && file !== path.basename(filePath)) {
                    fs.unlinkSync(path.join(dir, file));
                }
            }
            
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error al eliminar imagen:', error);
        return false;
    }
};

/* ========================================================================== */
/*  SUBIR Y OPTIMIZAR COMPROBANTE                                             */
/* ========================================================================== */

/**
 * Sube y optimiza un comprobante de pago (sin redimensionar drásticamente)
 * @param {Object} file - Archivo subido por multer
 * @param {string} folder - Carpeta destino
 * @returns {Promise<string>} - Ruta del comprobante optimizado
 */
const uploadReceipt = async (file, folder = 'comprobantes') => {
    if (!file || !file.path) {
        throw new Error('Archivo no válido para subir');
    }
    
    const outputDir = path.join(__dirname, '../../uploads', folder);
    const outputFilename = `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
    const outputPath = path.join(outputDir, outputFilename);
    
    try {
        // Verificar que el directorio existe
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Para comprobantes, solo comprimir sin cambiar dimensiones
        await sharp(file.path)
            .jpeg({ quality: 85 })
            .toFile(outputPath);
        
        // Eliminar archivo original
        fs.unlinkSync(file.path);
        
        return outputPath;
    } catch (error) {
        console.error('Error al subir comprobante:', error);
        
        // Si falla, mantener el original
        if (fs.existsSync(file.path)) {
            const originalExt = path.extname(file.path);
            const originalOutputPath = path.join(outputDir, `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${originalExt}`);
            fs.renameSync(file.path, originalOutputPath);
            return originalOutputPath;
        }
        
        throw new Error('No se pudo procesar el comprobante');
    }
};

/* ========================================================================== */
/*  ELIMINAR COMPROBANTE                                                      */
/* ========================================================================== */

/**
 * Elimina un comprobante de pago
 * @param {string} receiptUrl - URL o ruta del comprobante
 * @returns {Promise<boolean>} - true si se eliminó
 */
const deleteReceipt = async (receiptUrl) => {
    return deleteImage(receiptUrl);
};

/* ========================================================================== */
/*  VALIDAR IMAGEN                                                            */
/* ========================================================================== */

/**
 * Valida si un archivo es una imagen válida
 * @param {Object} file - Archivo subido por multer
 * @returns {Promise<boolean>} - true si es válida
 */
const validateImage = async (file) => {
    if (!file || !file.path) {
        return false;
    }
    
    try {
        const metadata = await sharp(file.path).metadata();
        const isValidFormat = ['jpeg', 'jpg', 'png', 'webp'].includes(metadata.format);
        const isValidSize = file.size <= CONFIG.MAX_FILE_SIZE;
        
        return isValidFormat && isValidSize;
    } catch (error) {
        return false;
    }
};

/* ========================================================================== */
/*  EXPORTAR FUNCIONES                                                        */
/* ========================================================================== */

module.exports = {
    optimizeImage,
    optimizeImageWithSizes,
    deleteImage,
    uploadReceipt,
    deleteReceipt,
    validateImage,
    CONFIG
};