/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: server.js                                                     */
/*  📁 UBICACIÓN: backend/src/server.js                                       */
/*  🚀 MÓDULO: Servidor Principal                                             */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Punto de entrada principal del backend. Configura y levanta el servidor  */
/*  Express, conecta las rutas, middlewares y maneja errores globales.       */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Inicialización del servidor Express                                    */
/*  ✅ Configuración de middlewares (CORS, JSON, logging)                     */
/*  ✅ Registro de todas las rutas de la API                                  */
/*  ✅ Manejo de errores global                                               */
/*  ✅ Conexión a base de datos PostgreSQL                                    */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • express - Framework web                                                 */
/*  • cors - Manejo de CORS                                                   */
/*  • morgan - Logging de peticiones HTTP                                     */
/*  • dotenv - Variables de entorno                                           */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: npm start o npm run dev                                  */
/*  • Usa: todas las rutas en /routes/                                        */
/*  • Depende de: .env para configuración                                     */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • El puerto se define en .env (PORT) o por defecto 5000                   */
/*  • En desarrollo, usar NODE_ENV=development                                */
/*  • Los logs se guardan en backend/logs/                                    */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Configuración base de Express                                      */
/*      ✅ Integración de rutas                                               */
/*                                                                            */
/* ========================================================================== */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config();

// Importar configuración de base de datos
const { connectDB } = require('./config/database');

// Importar middlewares
const { errorMiddleware } = require('./middlewares/errorMiddleware');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const saleRoutes = require('./routes/saleRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const backupRoutes = require('./routes/backupRoutes');
const logRoutes = require('./routes/logRoutes');
const brandRoutes = require('./routes/brandRoutes');

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3007;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5507';

/* ========================================================================== */
/*  MIDDLEWARES GLOBALES                                                      */
/* ========================================================================== */

// CORS - Permitir peticiones del frontend
app.use(cors({
    origin: [
        FRONTEND_URL,
        'http://localhost:5507',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
    ],
    credentials: true
}));

// Logging de peticiones HTTP
app.use(morgan('combined'));

// Parseo de JSON y URL encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

/* ========================================================================== */
/*  RUTAS DE LA API                                                           */
/* ========================================================================== */

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/brands', brandRoutes);

/* ========================================================================== */
/*  RUTA DE PRUEBA                                                            */
/* ========================================================================== */

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Mr. Luigi API funcionando correctamente', version: '1.0.0' });
});

/* ========================================================================== */
/*  MANEJO DE ERRORES GLOBAL                                                  */
/* ========================================================================== */

app.use(errorMiddleware);

/* ========================================================================== */
/*  INICIO DEL SERVIDOR                                                       */
/* ========================================================================== */

const startServer = async () => {
    try {
        // Conectar a base de datos
        await connectDB();
        
        const server = app.listen(PORT, () => {
            console.log(`🚀 Servidor Mr. Luigi ejecutándose en puerto ${PORT}`);
            console.log(`📁 Modo: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 API disponible en http://localhost:${PORT}/api`);
        });

        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ El puerto ${PORT} ya está en uso. Cierra la otra instancia o cambia PORT en backend/.env`);
            } else {
                console.error('❌ Error al iniciar el servidor HTTP:', error.message);
            }
            process.exit(1);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error.message);
        process.exit(1);
    }
};

startServer();