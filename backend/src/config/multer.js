// Archivo: multer.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: multer.js                                                     */
/*  📁 UBICACIÓN: backend/src/config/multer.js                                */
/*  🚀 MÓDULO: Configuración                                                  */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Configuración centralizada de Multer para la subida de archivos. Define  */
/*  las reglas de almacenamiento, filtros de archivos y límites para las     */
/*  diferentes carpetas del sistema (productos, comprobantes).               */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Configuración de almacenamiento para productos                         */
/*  ✅ Configuración de almacenamiento para comprobantes                      */
/*  ✅ Filtro de archivos por tipo MIME                                       */
/*  ✅ Límites de tamaño y cantidad de archivos                               */
/*  ✅ Generación automática de nombres únicos                                */
/*  ✅ Creación automática de directorios                                     */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • multer - Middleware para subida de archivos                             */
/*  • path - Manejo de rutas                                                  */
/*  • fs - Creación de directorios                                            */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: uploadMiddleware                                        */
/*  • Usa: multer.diskStorage para configuración                             */
/*  • Relacionado con: imageOptimizer                                        */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Los archivos se guardan temporalmente antes de optimizar                */
/*  • Los nombres incluyen timestamp para evitar colisiones                   */
/*  • Tamaño máximo: 5MB por archivo                                          */
/*  • Formatos permitidos: jpeg, jpg, png, webp                               */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Configuración de productos                                         */
/*      ✅ Configuración de comprobantes                                       */
/*      ✅ Filtro de archivos                                                 */
/*      ✅ Límites configurados                                               */
/*                                                                            */
/* ========================================================================== */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

/* ========================================================================== */
/*  CONFIGURACIÓN GENERAL                                                     */
/* ========================================================================== */

// Directorios base
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const PRODUCTOS_DIR = path.join(UPLOADS_DIR, 'productos');
const COMPROBANTES_DIR = path.join(UPLOADS_DIR, 'comprobantes');

// Límites globales
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 10; // Máximo 10 archivos por petición

// Formatos permitidos
const ALLOWED_MIMES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/* ========================================================================== */
/*  FUNCIONES AUXILIARES                                                      */
/* ========================================================================== */

/**
 * Asegura que un directorio exista
 * @param {string} dir - Ruta del directorio
 */
const ensureDirectoryExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Crear directorios necesarios
ensureDirectoryExists(PRODUCTOS_DIR);
ensureDirectoryExists(COMPROBANTES_DIR);

/**
 * Genera un nombre único para el archivo
 * @param {string} originalname - Nombre original del archivo
 * @param {string} prefix - Prefijo opcional
 * @returns {string} - Nombre único generado
 */
const generateUniqueFilename = (originalname, prefix = '') => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const ext = path.extname(originalname).toLowerCase();
    const baseName = path.basename(originalname, ext);
    
    // Sanitizar nombre base
    const sanitized = baseName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .substring(0, 50);
    
    if (prefix) {
        return `${prefix}_${timestamp}_${random}_${sanitized}${ext}`;
    }
    
    return `${timestamp}_${random}_${sanitized}${ext}`;
};

/* ========================================================================== */
/*  CONFIGURACIÓN DE ALMACENAMIENTO PARA PRODUCTOS                            */
/* ========================================================================== */

const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        ensureDirectoryExists(PRODUCTOS_DIR);
        cb(null, PRODUCTOS_DIR);
    },
    filename: (req, file, cb) => {
        const filename = generateUniqueFilename(file.originalname, 'prod');
        cb(null, filename);
    }
});

/* ========================================================================== */
/*  CONFIGURACIÓN DE ALMACENAMIENTO PARA COMPROBANTES                         */
/* ========================================================================== */

const receiptStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        ensureDirectoryExists(COMPROBANTES_DIR);
        cb(null, COMPROBANTES_DIR);
    },
    filename: (req, file, cb) => {
        const filename = generateUniqueFilename(file.originalname, 'receipt');
        cb(null, filename);
    }
});

/* ========================================================================== */
/*  FILTRO DE ARCHIVOS                                                        */
/* ========================================================================== */

/**
 * Filtra los archivos por tipo MIME y extensión
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} file - Archivo subido
 * @param {Function} cb - Función callback
 */
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (ALLOWED_MIMES.includes(file.mimetype) && ALLOWED_EXTENSIONS.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Formato no permitido. Use: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
    }
};

/* ========================================================================== */
/*  CONFIGURACIONES DE MULTER                                                 */
/* ========================================================================== */

/**
 * Configuración para subir imagen de producto (un solo archivo)
 */
const uploadProductImage = multer({
    storage: productStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1
    }
});

/**
 * Configuración para subir comprobante de pago (un solo archivo)
 */
const uploadReceipt = multer({
    storage: receiptStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1
    }
});

/**
 * Configuración para subir múltiples imágenes de productos
 */
const uploadMultipleProducts = multer({
    storage: productStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: MAX_FILES
    }
});

/**
 * Configuración para subir múltiples comprobantes
 */
const uploadMultipleReceipts = multer({
    storage: receiptStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 5
    }
});

/**
 * Configuración genérica para subir archivos temporales (sin optimización)
 */
const uploadTemp = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const tempDir = path.join(__dirname, '../../temp');
            ensureDirectoryExists(tempDir);
            cb(null, tempDir);
        },
        filename: (req, file, cb) => {
            const filename = generateUniqueFilename(file.originalname, 'temp');
            cb(null, filename);
        }
    }),
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: MAX_FILES
    }
});

/* ========================================================================== */
/*  MANEJADOR DE ERRORES DE MULTER                                            */
/* ========================================================================== */

/**
 * Middleware para manejar errores de Multer
 * @param {Error} err - Error de Multer
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función next
 */
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case 'FILE_TOO_LARGE':
                return res.status(400).json({
                    success: false,
                    message: `El archivo es demasiado grande. Máximo ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
                    code: 'FILE_TOO_LARGE'
                });
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    message: `El archivo excede el tamaño máximo permitido (${MAX_FILE_SIZE / (1024 * 1024)}MB)`,
                    code: 'LIMIT_FILE_SIZE'
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    success: false,
                    message: `Demasiados archivos. Máximo ${MAX_FILES} archivos`,
                    code: 'LIMIT_FILE_COUNT'
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    success: false,
                    message: 'Campo de archivo inesperado',
                    code: 'LIMIT_UNEXPECTED_FILE'
                });
            default:
                return res.status(400).json({
                    success: false,
                    message: `Error al subir archivo: ${err.message}`,
                    code: err.code
                });
        }
    }
    
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
            code: 'INVALID_FILE'
        });
    }
    
    next();
};

/* ========================================================================== */
/*  VALIDAR QUE HAYA ARCHIVO                                                  */
/* ========================================================================== */

/**
 * Middleware para validar que se haya subido al menos un archivo
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función next
 */
const validateFileExists = (req, res, next) => {
    if (!req.file && (!req.files || req.files.length === 0)) {
        return res.status(400).json({
            success: false,
            message: 'No se ha subido ningún archivo',
            code: 'NO_FILE'
        });
    }
    next();
};

/* ========================================================================== */
/*  EXPORTAR CONFIGURACIONES                                                  */
/* ========================================================================== */

module.exports = {
    // Middlewares de subida
    uploadProductImage,
    uploadReceipt,
    uploadMultipleProducts,
    uploadMultipleReceipts,
    uploadTemp,
    
    // Manejadores
    handleMulterError,
    validateFileExists,
    
    // Constantes
    MAX_FILE_SIZE,
    MAX_FILES,
    ALLOWED_MIMES,
    ALLOWED_EXTENSIONS,
    PRODUCTOS_DIR,
    COMPROBANTES_DIR,
    
    // Utilidades
    generateUniqueFilename,
    ensureDirectoryExists
};