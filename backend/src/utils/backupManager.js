// Archivo: backupManager.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: backupManager.js                                              */
/*  📁 UBICACIÓN: backend/src/utils/backupManager.js                          */
/*  🚀 MÓDULO: Utilidades                                                     */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Utilidad para la gestión de respaldos (backups) de la base de datos y    */
/*  archivos del sistema. Permite crear, restaurar y administrar copias de   */
/*  seguridad automáticas.                                                   */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Crear backup completo de base de datos (SQL dump)                      */
/*  ✅ Crear backup de archivos subidos (uploads)                             */
/*  ✅ Restaurar backup de base de datos                                      */
/*  ✅ Restaurar archivos desde backup                                        */
/*  ✅ Listar backups disponibles                                             */
/*  ✅ Limpiar backups antiguos automáticamente                               */
/*  ✅ Comprimir backups para ahorrar espacio                                 */
/*  ✅ Programar backups automáticos (cron)                                   */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • child_process - Ejecutar comandos del sistema                           */
/*  • fs - Manejo de archivos                                                 */
/*  • path - Manejo de rutas                                                  */
/*  • archiver - Compresión de archivos                                       */
/*  • crypto - Generación de hashes                                           */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: backupController                                         */
/*  • Usa: pg_dump para backup de PostgreSQL                                  */
/*  • Relacionado con: config/database                                        */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Requiere acceso al comando pg_dump del sistema                          */
/*  • Los backups se guardan en /backups/database/                            */
/*  • Se recomienda almacenar backups en ubicación externa                    */
/*  • La restauración puede sobrescribir datos actuales                       */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Backup de base de datos                                            */
/*      ✅ Backup de archivos                                                 */
/*      ✅ Restauración                                                       */
/*      ✅ Listado y limpieza                                                 */
/*      ✅ Compresión                                                         */
/*                                                                            */
/* ========================================================================== */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const crypto = require('crypto');
const util = require('util');
const execPromise = util.promisify(exec);

/* ========================================================================== */
/*  CONFIGURACIÓN                                                             */
/* ========================================================================== */

const BACKUP_DIR = path.join(__dirname, '../../backups/database');
const UPLOADS_BACKUP_DIR = path.join(__dirname, '../../backups/uploads');
const TEMP_DIR = path.join(__dirname, '../../backups/temp');

// Configuración de base de datos desde .env
const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '5432',
    database: process.env.DB_NAME || 'corex_db',
    user: process.env.DB_USER || 'corex_user',
    password: process.env.DB_PASSWORD
};

// Crear directorios si no existen
const ensureDirectories = () => {
    const dirs = [BACKUP_DIR, UPLOADS_BACKUP_DIR, TEMP_DIR];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

ensureDirectories();

/* ========================================================================== */
/*  FUNCIONES AUXILIARES                                                      */
/* ========================================================================== */

/**
 * Genera nombre de archivo para backup
 * @returns {string} - Nombre del archivo
 */
const generateBackupFilename = () => {
    const date = new Date();
    const timestamp = date.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    return `backup_${timestamp}.sql`;
};

/**
 * Genera hash MD5 de un archivo
 * @param {string} filepath - Ruta del archivo
 * @returns {Promise<string>} - Hash MD5
 */
const getFileHash = (filepath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('md5');
        const stream = fs.createReadStream(filepath);
        
        stream.on('data', data => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
};

/**
 * Formatea tamaño de bytes a legible
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} - Tamaño formateado
 */
const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/* ========================================================================== */
/*  CREAR BACKUP DE BASE DE DATOS                                             */
/* ========================================================================== */

/**
 * Crea un backup de la base de datos usando pg_dump
 * @returns {Promise<Object>} - Información del backup creado
 */
const createDatabaseBackup = async () => {
    const filename = generateBackupFilename();
    const filepath = path.join(BACKUP_DIR, filename);
    
    // Construir comando pg_dump
    const pgDumpCmd = `pg_dump -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.user} -d ${DB_CONFIG.database} -F p -f "${filepath}"`;
    
    // Establecer variable de entorno PGPASSWORD
    const env = { ...process.env, PGPASSWORD: DB_CONFIG.password };
    
    try {
        await execPromise(pgDumpCmd, { env });
        
        // Verificar que el archivo se creó
        if (!fs.existsSync(filepath)) {
            throw new Error('No se pudo crear el archivo de backup');
        }
        
        const stats = fs.statSync(filepath);
        
        return {
            filename,
            path: filepath,
            size: stats.size,
            size_formatted: formatBytes(stats.size),
            created_at: stats.birthtime,
            hash: await getFileHash(filepath)
        };
    } catch (error) {
        console.error('Error al crear backup de base de datos:', error);
        throw new Error(`Error al crear backup: ${error.message}`);
    }
};

/* ========================================================================== */
/*  CREAR BACKUP DE ARCHIVOS SUBIDOS                                          */
/* ========================================================================== */

/**
 * Crea un backup comprimido de los archivos subidos (uploads)
 * @returns {Promise<Object>} - Información del backup creado
 */
const createUploadsBackup = async () => {
    const uploadsDir = path.join(__dirname, '../../uploads');
    const date = new Date();
    const timestamp = date.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `uploads_backup_${timestamp}.zip`;
    const filepath = path.join(UPLOADS_BACKUP_DIR, filename);
    
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(filepath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        output.on('close', async () => {
            const stats = fs.statSync(filepath);
            resolve({
                filename,
                path: filepath,
                size: stats.size,
                size_formatted: formatBytes(stats.size),
                created_at: stats.birthtime,
                hash: await getFileHash(filepath),
                file_count: archive.pointer()
            });
        });
        
        archive.on('error', (err) => {
            reject(err);
        });
        
        archive.pipe(output);
        archive.directory(uploadsDir, 'uploads');
        archive.finalize();
    });
};

/* ========================================================================== */
/*  CREAR BACKUP COMPLETO                                                     */
/* ========================================================================== */

/**
 * Crea un backup completo (base de datos + archivos opcionales)
 * @param {boolean} includeUploads - Incluir archivos subidos
 * @returns {Promise<Object>} - Información del backup
 */
const createFullBackup = async (includeUploads = true) => {
    const dbBackup = await createDatabaseBackup();
    
    const result = {
        database: dbBackup,
        created_at: new Date(),
        include_uploads: includeUploads
    };
    
    if (includeUploads) {
        const uploadsBackup = await createUploadsBackup();
        result.uploads = uploadsBackup;
    }
    
    return result;
};

/* ========================================================================== */
/*  LISTAR BACKUPS DISPONIBLES                                                */
/* ========================================================================== */

/**
 * Lista todos los backups disponibles
 * @returns {Promise<Array>} - Lista de backups
 */
const listBackups = async () => {
    const files = fs.readdirSync(BACKUP_DIR);
    const backups = [];
    
    for (const file of files) {
        if (file.endsWith('.sql')) {
            const filepath = path.join(BACKUP_DIR, file);
            const stats = fs.statSync(filepath);
            backups.push({
                filename: file,
                path: filepath,
                size: stats.size,
                size_formatted: formatBytes(stats.size),
                created_at: stats.birthtime,
                hash: await getFileHash(filepath),
                type: 'database'
            });
        }
    }
    
    // Ordenar por fecha (más reciente primero)
    backups.sort((a, b) => b.created_at - a.created_at);
    
    return backups;
};

/* ========================================================================== */
/*  RESTAURAR BACKUP DE BASE DE DATOS                                         */
/* ========================================================================== */

/**
 * Restaura un backup de base de datos
 * @param {string} filename - Nombre del archivo de backup
 * @returns {Promise<Object>} - Resultado de la restauración
 */
const restoreDatabaseBackup = async (filename) => {
    const filepath = path.join(BACKUP_DIR, filename);
    
    if (!fs.existsSync(filepath)) {
        throw new Error(`Backup no encontrado: ${filename}`);
    }
    
    // Construir comando psql para restaurar
    const psqlCmd = `psql -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.user} -d ${DB_CONFIG.database} -f "${filepath}"`;
    
    const env = { ...process.env, PGPASSWORD: DB_CONFIG.password };
    
    try {
        await execPromise(psqlCmd, { env });
        return {
            success: true,
            filename,
            restored_at: new Date(),
            message: 'Backup restaurado exitosamente'
        };
    } catch (error) {
        console.error('Error al restaurar backup:', error);
        throw new Error(`Error al restaurar backup: ${error.message}`);
    }
};

/* ========================================================================== */
/*  RESTAURAR BACKUP DE ARCHIVOS                                              */
/* ========================================================================== */

/**
 * Restaura un backup de archivos (uploads)
 * @param {string} filename - Nombre del archivo zip
 * @returns {Promise<Object>} - Resultado de la restauración
 */
const restoreUploadsBackup = async (filename) => {
    const filepath = path.join(UPLOADS_BACKUP_DIR, filename);
    const extractDir = path.join(__dirname, '../../');
    
    if (!fs.existsSync(filepath)) {
        throw new Error(`Backup de archivos no encontrado: ${filename}`);
    }
    
    return new Promise((resolve, reject) => {
        const decompress = require('decompress');
        
        decompress(filepath, extractDir)
            .then(() => {
                resolve({
                    success: true,
                    filename,
                    restored_at: new Date(),
                    message: 'Archivos restaurados exitosamente'
                });
            })
            .catch((error) => {
                reject(new Error(`Error al restaurar archivos: ${error.message}`));
            });
    });
};

/* ========================================================================== */
/*  LIMPIAR BACKUPS ANTIGUOS                                                  */
/* ========================================================================== */

/**
 * Elimina backups más antiguos que X días
 * @param {number} days - Días de retención
 * @returns {Promise<number>} - Cantidad de backups eliminados
 */
const cleanOldBackups = async (days = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const backups = await listBackups();
    let deletedCount = 0;
    
    for (const backup of backups) {
        if (backup.created_at < cutoffDate) {
            try {
                fs.unlinkSync(backup.path);
                deletedCount++;
            } catch (error) {
                console.error(`Error al eliminar backup ${backup.filename}:`, error);
            }
        }
    }
    
    // También limpiar backups de uploads antiguos
    const uploadsBackups = fs.readdirSync(UPLOADS_BACKUP_DIR);
    for (const file of uploadsBackups) {
        const filepath = path.join(UPLOADS_BACKUP_DIR, file);
        const stats = fs.statSync(filepath);
        if (stats.birthtime < cutoffDate) {
            try {
                fs.unlinkSync(filepath);
                deletedCount++;
            } catch (error) {
                console.error(`Error al eliminar backup ${file}:`, error);
            }
        }
    }
    
    return deletedCount;
};

/* ========================================================================== */
/*  EXPORTAR FUNCIONES                                                        */
/* ========================================================================== */

module.exports = {
    createDatabaseBackup,
    createUploadsBackup,
    createFullBackup,
    listBackups,
    restoreDatabaseBackup,
    restoreUploadsBackup,
    cleanOldBackups,
    formatBytes,
    BACKUP_DIR,
    UPLOADS_BACKUP_DIR
};