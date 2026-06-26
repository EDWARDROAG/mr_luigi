// Archivo: authMiddleware.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: authMiddleware.js                                             */
/*  📁 UBICACIÓN: backend/src/middlewares/authMiddleware.js                   */
/*  🚀 MÓDULO: Middlewares                                                    */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Middleware de autenticación que verifica el token JWT en las peticiones.  */
/*  Extrae el usuario del token y lo adjunta al objeto request.              */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Verificación de token Bearer en headers Authorization                  */
/*  ✅ Validación de firma y expiración del JWT                               */
/*  ✅ Adjunta usuario decodificado a req.user                                */
/*  ✅ Manejo de errores de autenticación                                     */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • jsonwebtoken - Verificación y decodificación de JWT                     */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: routes que requieren autenticación                       */
/*  • Usa: JWT_SECRET del archivo .env                                        */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • El token debe enviarse como: Authorization: Bearer <token>             */
/*  • El token expira según JWT_EXPIRE (por defecto 8 horas)                  */
/*  • En caso de error, retorna 401 (No autorizado)                           */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Implementación de verifyToken                                       */
/*      ✅ Manejo de errores de expiración y firma inválida                    */
/*                                                                            */
/* ========================================================================== */

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Acceso denegado. Token no proporcionado o formato inválido.'
        });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Adjuntar usuario decodificado al request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado. Por favor inicie sesión nuevamente.'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido.'
            });
        }
        
        return res.status(401).json({
            success: false,
            message: 'Error de autenticación.'
        });
    }
};

module.exports = { authMiddleware };