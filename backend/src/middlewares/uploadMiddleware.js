// Archivo: uploadMiddleware.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: uploadMiddleware.js                                           */
/*  📁 UBICACIÓN: backend/src/middlewares/uploadMiddleware.js                 */
/*  🚀 MÓDULO: Middlewares                                                    */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Middleware para la gestión de subida de archivos. Configura multer para  */
/*  manejar la carga de imágenes de productos y comprobantes de pago,        */
/*  aplicando validaciones de tipo, tamaño y nombre de archivo.              */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Configuración de almacenamiento para productos                         */
/*  ✅ Configuración de almacenamiento para comprobantes                      */
/*  ✅ Validación de tipos de archivo (jpg, png, webp)                        */
/*  ✅ Validación de tamaño máximo (5MB)                                      */
/*  ✅ Sanitización de nombres de archivo                                     */
/*  ✅ Manejo de errores de subida                                            */
/*  ✅ Soporte para archivos múltiples                                        */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • multer - Middleware para subida de archivos                             */
/*  • path - Manejo de rutas de archivos                                      */
/*  • fs - Creación de directorios                                            */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: productRoutes, saleRoutes, uploadRoutes                  */
/*  • Usa: diskStorage para almacenamiento local                              */
/*  • Relacionado con: imageOptimizer (optimización posterior)                */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Tamaño máximo permitido: 5MB                                            */
/*  • Formatos permitidos: jpeg, jpg, png, webp                               */
/*  • Los archivos se guardan con timestamp para evitar colisiones           */
/*  • Las carpetas se crean automáticamente si no existen                     */
/*  • Después de subir, las imágenes deben optimizarse                        */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Configuración de multer                                            */
/*      ✅ Validación de archivos                                             */
/*      ✅ Sanitización de nombres                                            */
/*      ✅ Middleware para productos y comprobantes                           */
/*                                                                            */
/* ========================================================================== */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

/* ========================================================================== */
/*  CONFIGURACIÓN DE ALMACENAMIENTO                                           */
/* ========================================================================== */

// Directorios base de uploads
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const PRODUCTOS_DIR = path.join(UPLOADS_DIR, 'productos');
const COMPROBANTES_DIR = path.join(UPLOADS_DIR, 'comprobantes');

// Crear directorios si no existen
const ensureDirectoryExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

ensureDirectoryExists(PRODUCTOS_DIR);
ensureDirectoryExists(COMPROBANTES_DIR);

/* ========================================================================== */
/*  FUNCIÓN PARA SANITIZAR NOMBRE DE ARCHIVO                                  */
/* ========================================================================== */

const sanitizeFilename = (originalname) => {
    // Eliminar caracteres especiales y espacios
    const name = originalname
        .toLowerCase()
        .replace(/[^a-z0-9.-]/g, '_')
        .replace(/_+/g, '_');
    
    // Agregar timestamp para evitar colisiones
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    
    return `${timestamp}_${random}_${name}`;
};

/* ========================================================================== */
/*  CONFIGURACIÓN DE STORAGE PARA PRODUCTOS                                   */
/* ========================================================================== */

const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, PRODUCTOS_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const sanitized = sanitizeFilename(path.basename(file.originalname, ext));
        cb(null, `${sanitized}${ext}`);
    }
});

/* ========================================================================== */
/*  CONFIGURACIÓN DE STORAGE PARA COMPROBANTES                                */
/* ========================================================================== */

const receiptStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, COMPROBANTES_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const sanitized = sanitizeFilename(path.basename(file.originalname, ext));
        cb(null, `receipt_${sanitized}${ext}`);
    }
});

/* ========================================================================== */
/*  FILTRO DE ARCHIVOS (VALIDACIÓN DE TIPO)                                   */
/* ========================================================================== */

const fileFilter = (req, file, cb) => {
    // Tipos de archivo permitidos
    const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
    ];
    
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Formato no permitido. Use JPG, PNG o WEBP'), false);
    }
};

/* ========================================================================== */
/*  CONFIGURACIÓN DE LIMITES                                                  */
/* ========================================================================== */

const limits = {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 1 // Máximo 1 archivo por petición
};

/* ========================================================================== */
/*  MIDDLEWARES DE SUBIDA                                                     */
/* ========================================================================== */

/**
 * Middleware para subir imagen de producto
 * Uso: uploadProductImage.single('imagen')
 */
const uploadProductImage = multer({
    storage: productStorage,
    fileFilter: fileFilter,
    limits: limits
});

/**
 * Middleware para subir comprobante de transferencia
 * Uso: uploadReceipt.single('comprobante')
 */
const uploadReceipt = multer({
    storage: receiptStorage,
    fileFilter: fileFilter,
    limits: limits
});

/**
 * Middleware para subir múltiples imágenes de productos
 * Uso: uploadMultipleImages.array('imagenes', 5)
 */
const uploadMultipleImages = multer({
    storage: productStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB por archivo
        files: 5 // Máximo 5 archivos
    }
});

/* ========================================================================== */
/*  MANEJADOR DE ERRORES DE MULTER                                            */
/* ========================================================================== */

const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'FILE_TOO_LARGE') {
            return res.status(400).json({
                success: false,
                message: 'El archivo es demasiado grande. Máximo 5MB',
                code: 'FILE_TOO_LARGE'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Demasiados archivos. Máximo 5',
                code: 'LIMIT_FILE_COUNT'
            });
        }
        return res.status(400).json({
            success: false,
            message: `Error al subir archivo: ${err.message}`,
            code: err.code
        });
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
/*  MIDDLEWARE PARA VALIDAR QUE HAYA ARCHIVO                                  */
/* ========================================================================== */

const validateFileExists = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No se ha subido ningún archivo',
            code: 'NO_FILE'
        });
    }
    next();
};

/* ========================================================================== */
/*  EXPORTAR MIDDLEWARES                                                      */
/* ========================================================================== */

module.exports = {
    uploadProductImage,
    uploadReceipt,
    uploadMultipleImages,
    handleMulterError,
    validateFileExists,
    // Exportar directorios para uso externo
    PRODUCTOS_DIR,
    COMPROBANTES_DIR
};