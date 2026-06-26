// Archivo: roleMiddleware.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: roleMiddleware.js                                             */
/*  📁 UBICACIÓN: backend/src/middlewares/roleMiddleware.js                   */
/*  🚀 MÓDULO: Middlewares                                                    */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Middleware para verificar roles de usuario. Permite restringir acceso    */
/*  a rutas según el rol (admin, cajero).                                    */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Verificar que el usuario tenga rol de administrador                    */
/*  ✅ Verificar que el usuario tenga rol de cajero                           */
/*  ✅ Verificar múltiples roles permitidos                                   */
/*  ✅ Manejo de errores de permisos insuficientes                            */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • Ninguna (usa req.user del authMiddleware)                               */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: routes que requieren roles específicos                   */
/*  • Depende de: authMiddleware (debe ejecutarse después)                    */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Los roles disponibles: 'admin' y 'cajero'                               */
/*  • El admin tiene acceso a todo, el cajero solo a ventas e inventario     */
/*  • Siempre ejecutar authMiddleware antes que roleMiddleware                */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Implementación de isAdmin, isCajero, checkRoles                    */
/*                                                                            */
/* ========================================================================== */

/* ========================================================================== */
/*  VERIFICAR QUE SEA ADMINISTRADOR                                           */
/* ========================================================================== */

const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'No autenticado.'
        });
    }
    
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requieren privilegios de administrador.'
        });
    }
    
    next();
};

/* ========================================================================== */
/*  VERIFICAR QUE SEA CAJERO                                                  */
/* ========================================================================== */

const isCajero = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'No autenticado.'
        });
    }
    
    if (req.user.role !== 'cajero' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requieren privilegios de cajero.'
        });
    }
    
    next();
};

/* ========================================================================== */
/*  VERIFICAR MÚLTIPLES ROLES                                                 */
/* ========================================================================== */

const checkRoles = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado.'
            });
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Acceso denegado. Roles permitidos: ${allowedRoles.join(', ')}`
            });
        }
        
        next();
    };
};

module.exports = {
    isAdmin,
    isCajero,
    checkRoles
};