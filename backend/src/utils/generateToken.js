// Archivo: generateToken.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: generateToken.js                                              */
/*  📁 UBICACIÓN: backend/src/utils/generateToken.js                          */
/*  🚀 MÓDULO: Utilidades                                                     */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Utilidad para la generación y manejo de tokens JWT (JSON Web Tokens).    */
/*  Permite crear tokens de acceso, verificar su validez y refrescarlos.     */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Generar token de acceso para usuario autenticado                       */
/*  ✅ Generar token de refresco (refresh token)                             */
/*  ✅ Verificar validez de token                                             */
/*  ✅ Decodificar token sin verificar                                        */
/*  ✅ Calcular tiempo de expiración restante                                 */
/*  ✅ Extraer información del usuario desde token                            */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • jsonwebtoken - Creación y verificación de JWT                          */
/*  • dotenv - Variables de entorno                                           */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: authController, authMiddleware                           */
/*  • Usa: JWT_SECRET y JWT_EXPIRE del archivo .env                          */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • El token de acceso expira según JWT_EXPIRE (por defecto 8 horas)       */
/*  • El refresh token expira después de 7 días                              */
/*  • Nunca almacenar tokens en localStorage para información sensible       */
/*  • Los tokens deben enviarse en header Authorization: Bearer <token>      */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Generación de token de acceso                                       */
/*      ✅ Generación de refresh token                                        */
/*      ✅ Verificación de token                                              */
/*      ✅ Decodificación de token                                            */
/*                                                                            */
/* ========================================================================== */

const jwt = require('jsonwebtoken');

/* ========================================================================== */
/*  CONFIGURACIÓN                                                             */
/* ========================================================================== */

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '8h';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';

if (!JWT_SECRET) {
    console.error('❌ JWT_SECRET no está definido en las variables de entorno');
    process.exit(1);
}

/* ========================================================================== */
/*  GENERAR TOKEN DE ACCESO                                                   */
/* ========================================================================== */

const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        nombre: user.nombre
    };
    
    const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRE
    });
    
    return token;
};

/* ========================================================================== */
/*  GENERAR TOKEN DE REFRESCO                                                 */
/* ========================================================================== */

const generateRefreshToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        type: 'refresh'
    };
    
    const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRE
    });
    
    return token;
};

/* ========================================================================== */
/*  VERIFICAR TOKEN                                                           */
/* ========================================================================== */

const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return {
            valid: true,
            decoded: decoded,
            expired: false
        };
    } catch (error) {
        return {
            valid: false,
            decoded: null,
            expired: error.name === 'TokenExpiredError',
            error: error.message
        };
    }
};

/* ========================================================================== */
/*  DECODIFICAR TOKEN SIN VERIFICAR                                           */
/* ========================================================================== */

const decodeToken = (token) => {
    try {
        const decoded = jwt.decode(token);
        return decoded;
    } catch (error) {
        return null;
    }
};

/* ========================================================================== */
/*  OBTENER TIEMPO DE EXPIRACIÓN RESTANTE                                     */
/* ========================================================================== */

const getTokenExpirationTime = (token) => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
        return 0;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    const timeLeft = decoded.exp - currentTime;
    
    return timeLeft > 0 ? timeLeft : 0;
};

/* ========================================================================== */
/*  REFRESCAR TOKEN                                                           */
/* ========================================================================== */

const refreshToken = (refreshToken) => {
    const verification = verifyToken(refreshToken);
    
    if (!verification.valid || verification.decoded?.type !== 'refresh') {
        return {
            success: false,
            message: 'Refresh token inválido o expirado'
        };
    }
    
    // Generar nuevo token de acceso
    const user = {
        id: verification.decoded.id,
        email: verification.decoded.email
    };
    
    // Obtener información adicional del usuario (si es necesario)
    // Esto debería consultarse a la base de datos
    
    const newToken = generateToken(user);
    
    return {
        success: true,
        token: newToken,
        expiresIn: getTokenExpirationTime(newToken)
    };
};

/* ========================================================================== */
/*  EXTRAER USUARIO DESDE TOKEN                                               */
/* ========================================================================== */

const extractUserFromToken = (token) => {
    const decoded = decodeToken(token);
    
    if (!decoded) {
        return null;
    }
    
    return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        nombre: decoded.nombre
    };
};

/* ========================================================================== */
/*  GENERAR PAR DE TOKENS (ACCESO + REFRESCO)                                 */
/* ========================================================================== */

const generateTokenPair = (user) => {
    return {
        accessToken: generateToken(user),
        refreshToken: generateRefreshToken(user),
        expiresIn: JWT_EXPIRE,
        refreshExpiresIn: JWT_REFRESH_EXPIRE
    };
};

/* ========================================================================== */
/*  EXPORTAR FUNCIONES                                                        */
/* ========================================================================== */

module.exports = {
    generateToken,
    generateRefreshToken,
    verifyToken,
    decodeToken,
    getTokenExpirationTime,
    refreshToken,
    extractUserFromToken,
    generateTokenPair
};