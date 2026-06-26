// Archivo: logger.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: logger.js                                                     */
/*  📁 UBICACIÓN: backend/src/utils/logger.js                                 */
/*  🚀 MÓDULO: Utilidades                                                     */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Utilidad para el registro de logs (logging) del sistema. Proporciona     */
/*  diferentes niveles de log (info, error, warn, debug) y almacenamiento    */
/*  tanto en consola como en archivos.                                       */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Logging con diferentes niveles (error, warn, info, debug)              */
/*  ✅ Almacenamiento en archivos rotativos                                   */
/*  ✅ Salida en consola con colores (desarrollo)                             */
/*  ✅ Formato JSON para producción                                           */
/*  ✅ Captura de excepciones no manejadas                                    */
/*  ✅ Logging de peticiones HTTP                                             */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • winston - Biblioteca de logging                                         */
/*  • winston-daily-rotate-file - Rotación diaria de archivos                */
/*  • path - Manejo de rutas                                                  */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: server.js, controladores, middlewares                    */
/*  • Usa: winston para almacenamiento                                        */
/*  • Relacionado con: errorMiddleware                                        */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • En producción, los logs se guardan en archivos rotativos diarios       */
/*  • En desarrollo, los logs se muestran en consola con colores             */
/*  • Los archivos de log se guardan en /logs/                                */
/*  • Se implementa retención de 30 días                                      */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Configuración de winston                                           */
/*      ✅ Rotación de archivos                                               */
/*      ✅ Diferentes niveles de log                                          */
/*      ✅ Formato personalizado                                              */
/*                                                                            */
/* ========================================================================== */

const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

/* ========================================================================== */
/*  CONFIGURACIÓN                                                             */
/* ========================================================================== */

// Directorio de logs
const LOG_DIR = path.join(__dirname, '../../logs');

// Crear directorio si no existe
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Nivel de log según entorno
const LOG_LEVEL = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

/* ========================================================================== */
/*  FORMATOS PERSONALIZADOS                                                   */
/* ========================================================================== */

// Formato para consola (con colores)
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        
        if (Object.keys(meta).length > 0 && meta.stack) {
            log += `\n${meta.stack}`;
        } else if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
        }
        
        return log;
    })
);

// Formato para archivos (JSON)
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Formato simple para archivos de error
const errorFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message}${stack ? `\n${stack}` : ''}`;
    })
);

/* ========================================================================== */
/*  TRANSPORTES (DESTINOS DE LOG)                                             */
/* ========================================================================== */

// Transporte para consola
const consoleTransport = new winston.transports.Console({
    level: LOG_LEVEL,
    format: consoleFormat
});

// Transporte para archivo de errores (solo errores)
const errorFileTransport = new winston.transports.DailyRotateFile({
    filename: path.join(LOG_DIR, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: errorFormat,
    maxSize: '20m',
    maxFiles: '30d',
    zippedArchive: true
});

// Transporte para archivo de acceso (todos los logs)
const accessFileTransport = new winston.transports.DailyRotateFile({
    filename: path.join(LOG_DIR, 'access-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'info',
    format: fileFormat,
    maxSize: '20m',
    maxFiles: '30d',
    zippedArchive: true
});

// Transporte para archivo de debug (solo desarrollo)
let debugFileTransport = null;
if (process.env.NODE_ENV !== 'production') {
    debugFileTransport = new winston.transports.DailyRotateFile({
        filename: path.join(LOG_DIR, 'debug-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'debug',
        format: fileFormat,
        maxSize: '20m',
        maxFiles: '7d',
        zippedArchive: true
    });
}

/* ========================================================================== */
/*  CREAR LOGGER                                                              */
/* ========================================================================== */

const transports = [consoleTransport, errorFileTransport, accessFileTransport];

if (debugFileTransport) {
    transports.push(debugFileTransport);
}

const logger = winston.createLogger({
    level: LOG_LEVEL,
    format: fileFormat,
    transports: transports,
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(LOG_DIR, 'exceptions.log'),
            format: errorFormat
        })
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(LOG_DIR, 'rejections.log'),
            format: errorFormat
        })
    ]
});

/* ========================================================================== */
/*  FUNCIONES DE LOG (WRAPPERS)                                               */
/* ========================================================================== */

/**
 * Log de nivel error
 * @param {string} message - Mensaje de error
 * @param {Object} meta - Metadatos adicionales
 */
const error = (message, meta = {}) => {
    logger.error(message, meta);
};

/**
 * Log de nivel warn
 * @param {string} message - Mensaje de advertencia
 * @param {Object} meta - Metadatos adicionales
 */
const warn = (message, meta = {}) => {
    logger.warn(message, meta);
};

/**
 * Log de nivel info
 * @param {string} message - Mensaje informativo
 * @param {Object} meta - Metadatos adicionales
 */
const info = (message, meta = {}) => {
    logger.info(message, meta);
};

/**
 * Log de nivel debug (solo desarrollo)
 * @param {string} message - Mensaje de debug
 * @param {Object} meta - Metadatos adicionales
 */
const debug = (message, meta = {}) => {
    logger.debug(message, meta);
};

/**
 * Log de petición HTTP
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {number} duration - Duración de la petición en ms
 */
const http = (req, res, duration) => {
    const logData = {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.user?.id || null
    };
    
    if (res.statusCode >= 400) {
        logger.warn(`HTTP ${req.method} ${req.url}`, logData);
    } else {
        logger.info(`HTTP ${req.method} ${req.url}`, logData);
    }
};

/* ========================================================================== */
/*  FUNCIÓN PARA LOG DE AUDITORÍA                                             */
/* ========================================================================== */

/**
 * Log de auditoría para acciones importantes
 * @param {string} action - Acción realizada
 * @param {number} userId - ID del usuario que realizó la acción
 * @param {Object} details - Detalles adicionales
 */
const audit = (action, userId, details = {}) => {
    logger.info(`AUDIT: ${action}`, {
        action,
        userId,
        details,
        timestamp: new Date().toISOString()
    });
};

/* ========================================================================== */
/*  FUNCIÓN PARA LOG DE SISTEMA                                               */
/* ========================================================================== */

/**
 * Log de eventos del sistema
 * @param {string} event - Evento del sistema
 * @param {string} status - Estado (start, stop, error, etc.)
 * @param {Object} details - Detalles adicionales
 */
const system = (event, status, details = {}) => {
    logger.info(`SYSTEM: ${event} - ${status}`, {
        event,
        status,
        details,
        timestamp: new Date().toISOString()
    });
};

/* ========================================================================== */
/*  FUNCIÓN PARA LOG DE BASE DE DATOS                                         */
/* ========================================================================== */

/**
 * Log de operaciones de base de datos
 * @param {string} operation - Operación realizada (SELECT, INSERT, UPDATE, DELETE)
 * @param {string} table - Tabla afectada
 * @param {Object} details - Detalles de la operación
 */
const database = (operation, table, details = {}) => {
    if (process.env.NODE_ENV !== 'production') {
        logger.debug(`DB: ${operation} on ${table}`, {
            operation,
            table,
            details
        });
    }
};

/* ========================================================================== */
/*  OBTENER NIVEL DE LOG ACTUAL                                               */
/* ========================================================================== */

const getLogLevel = () => {
    return LOG_LEVEL;
};

/* ========================================================================== */
/*  EXPORTAR LOGGER                                                           */
/* ========================================================================== */

module.exports = {
    logger,
    error,
    warn,
    info,
    debug,
    http,
    audit,
    system,
    database,
    getLogLevel
};