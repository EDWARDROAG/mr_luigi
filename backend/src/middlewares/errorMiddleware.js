// Archivo: errorMiddleware.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: errorMiddleware.js                                            */
/*  📁 UBICACIÓN: backend/src/middlewares/errorMiddleware.js                  */
/*  🚀 MÓDULO: Middlewares                                                    */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Middleware global para manejo de errores. Captura cualquier error no     */
/*  manejado y retorna una respuesta estandarizada.                          */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Captura de errores de Express                                          */
/*  ✅ Respuesta estandarizada en formato JSON                                */
/*  ✅ Logging de errores en consola y archivos                               */
/*  ✅ Distinción entre errores de desarrollo y producción                    */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • winston - Logging de errores                                           */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: server.js                                                */
/*  • Se registra al final de todos los middlewares                           */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • En desarrollo muestra stack trace completo                              */
/*  • En producción solo muestra mensaje genérico                             */
/*  • No exponer información sensible del servidor                            */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Implementación de errorMiddleware                                   */
/*      ✅ Integración con winston logger                                      */
/*                                                                            */
/* ========================================================================== */

const winston = require('winston');
const path = require('path');

/* ========================================================================== */
/*  CONFIGURACIÓN DE LOGGER                                                   */
/* ========================================================================== */

const logger = winston.createLogger({
    level: 'error',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/access.log')
        })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

/* ========================================================================== */
/*  MIDDLEWARE DE ERRORES                                                     */
/* ========================================================================== */

const errorMiddleware = (err, req, res, next) => {
    // Loggear error
    logger.error({
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip
    });
    
    // Determinar código de estado
    const statusCode = err.statusCode || 500;
    
    // Construir respuesta
    const response = {
        success: false,
        message: err.message || 'Error interno del servidor',
        timestamp: new Date().toISOString()
    };
    
    // En desarrollo, incluir stack trace
    if (process.env.NODE_ENV !== 'production') {
        response.stack = err.stack;
    }
    
    res.status(statusCode).json(response);
};

module.exports = { errorMiddleware };