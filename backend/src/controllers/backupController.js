// Archivo: backupController.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: backupController.js                                           */
/*  📁 UBICACIÓN: backend/src/controllers/backupController.js                 */
/*  🚀 MÓDULO: Controladores                                                  */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Controlador para la gestión de respaldos (backups) del sistema. Permite  */
/*  crear, descargar y restaurar copias de seguridad de la base de datos     */
/*  y archivos subidos. Solo accesible por administradores.                  */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Crear backup completo (base de datos + archivos)                       */
/*  ✅ Listar backups disponibles                                             */
/*  ✅ Descargar backup                                                       */
/*  ✅ Restaurar backup (base de datos)                                       */
/*  ✅ Eliminar backup antiguo                                                */
/*  ✅ Backup automático programado (cron)                                    */
/*  ✅ Configurar retención de backups (días)                                */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • backupManager - Utilidades de backup                                    */
/*  • Log Model - Registro de acciones                                        */
/*  • fs - Manejo de sistema de archivos                                      */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: backupRoutes.js                                          */
/*  • Usa: backupManager, Log                                                 */
/*  • Solo accesible por administradores                                      */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Solo administradores pueden gestionar backups                          */
/*  • Los backups se guardan en /backups/                                     */
/*  • Retención predeterminada: 30 días                                       */
/*  • Restaurar backup puede sobrescribir datos actuales                      */
/*  • Se recomienda crear backup antes de restaurar                          */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Backup de base de datos                                            */
/*      ✅ Listado de backups                                                 */
/*      ✅ Restauración de backup                                             */
/*      ✅ Eliminación de backups                                             */
/*                                                                            */
/* ========================================================================== */

const backupManager = require('../utils/backupManager');
const Log = require('../models/Log');
const fs = require('fs');
const path = require('path');

/* ========================================================================== */
/*  CREAR BACKUP COMPLETO                                                     */
/* ========================================================================== */

const createBackup = async (req, res) => {
    try {
        const { include_uploads = true } = req.body;
        
        // Registrar inicio del backup en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'INICIAR_BACKUP',
            detalle: `Creando backup - Incluir archivos: ${include_uploads}`
        });
        
        // Crear backup
        const backupResult = await backupManager.createFullBackup(include_uploads);
        
        // Registrar éxito en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'BACKUP_COMPLETADO',
            detalle: `Backup creado: ${backupResult.filename} - Tamaño: ${backupResult.size}`
        });
        
        res.status(201).json({
            success: true,
            message: 'Backup creado exitosamente',
            data: {
                filename: backupResult.filename,
                path: backupResult.path,
                size: backupResult.size,
                created_at: backupResult.created_at,
                include_uploads: include_uploads
            }
        });
        
    } catch (error) {
        console.error('Error en createBackup:', error);
        
        // Registrar error en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'BACKUP_ERROR',
            detalle: `Error al crear backup: ${error.message}`
        });
        
        res.status(500).json({
            success: false,
            message: 'Error al crear el backup',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  LISTAR BACKUPS DISPONIBLES                                                */
/* ========================================================================== */

const listBackups = async (req, res) => {
    try {
        const backups = await backupManager.listBackups();
        
        res.status(200).json({
            success: true,
            data: backups,
            total: backups.length
        });
        
    } catch (error) {
        console.error('Error en listBackups:', error);
        res.status(500).json({
            success: false,
            message: 'Error al listar los backups',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  DESCARGAR BACKUP                                                          */
/* ========================================================================== */

const downloadBackup = async (req, res) => {
    try {
        const { filename } = req.params;
        
        // Validar que el archivo exista
        const backupPath = path.join(__dirname, '../../backups/database', filename);
        
        if (!fs.existsSync(backupPath)) {
            return res.status(404).json({
                success: false,
                message: 'Backup no encontrado'
            });
        }
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'DESCARGAR_BACKUP',
            detalle: `Backup descargado: ${filename}`
        });
        
        // Enviar archivo
        res.download(backupPath, filename, (err) => {
            if (err) {
                console.error('Error al descargar backup:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error al descargar el backup'
                });
            }
        });
        
    } catch (error) {
        console.error('Error en downloadBackup:', error);
        res.status(500).json({
            success: false,
            message: 'Error al descargar el backup',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  RESTAURAR BACKUP                                                          */
/* ========================================================================== */

const restoreBackup = async (req, res) => {
    try {
        const { filename, restore_uploads = false } = req.body;
        
        if (!filename) {
            return res.status(400).json({
                success: false,
                message: 'El nombre del backup es requerido'
            });
        }
        
        // Verificar que el backup exista
        const backupPath = path.join(__dirname, '../../backups/database', filename);
        
        if (!fs.existsSync(backupPath)) {
            return res.status(404).json({
                success: false,
                message: 'Backup no encontrado'
            });
        }
        
        // Registrar inicio de restauración
        await Log.create({
            usuario_id: req.user.id,
            accion: 'INICIAR_RESTAURACION',
            detalle: `Restaurando backup: ${filename} - Incluir archivos: ${restore_uploads}`
        });
        
        // Restaurar backup
        const restoreResult = await backupManager.restoreBackup(filename, restore_uploads);
        
        // Registrar éxito
        await Log.create({
            usuario_id: req.user.id,
            accion: 'RESTAURACION_COMPLETADA',
            detalle: `Backup restaurado: ${filename}`
        });
        
        res.status(200).json({
            success: true,
            message: 'Backup restaurado exitosamente',
            data: restoreResult
        });
        
    } catch (error) {
        console.error('Error en restoreBackup:', error);
        
        // Registrar error
        await Log.create({
            usuario_id: req.user.id,
            accion: 'RESTAURACION_ERROR',
            detalle: `Error al restaurar backup: ${error.message}`
        });
        
        res.status(500).json({
            success: false,
            message: 'Error al restaurar el backup',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  ELIMINAR BACKUP                                                           */
/* ========================================================================== */

const deleteBackup = async (req, res) => {
    try {
        const { filename } = req.params;
        
        // Verificar que el backup exista
        const backupPath = path.join(__dirname, '../../backups/database', filename);
        
        if (!fs.existsSync(backupPath)) {
            return res.status(404).json({
                success: false,
                message: 'Backup no encontrado'
            });
        }
        
        // Obtener información del archivo
        const stats = fs.statSync(backupPath);
        
        // Eliminar archivo
        fs.unlinkSync(backupPath);
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'ELIMINAR_BACKUP',
            detalle: `Backup eliminado: ${filename} (Tamaño: ${stats.size} bytes)`
        });
        
        res.status(200).json({
            success: true,
            message: 'Backup eliminado exitosamente'
        });
        
    } catch (error) {
        console.error('Error en deleteBackup:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el backup',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  LIMPIAR BACKUPS ANTIGUOS                                                  */
/* ========================================================================== */

const cleanOldBackups = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        
        const deletedCount = await backupManager.cleanOldBackups(parseInt(days));
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'LIMPIAR_BACKUPS',
            detalle: `${deletedCount} backups eliminados (retención: ${days} días)`
        });
        
        res.status(200).json({
            success: true,
            message: `${deletedCount} backups antiguos eliminados`,
            data: {
                deleted_count: deletedCount,
                retention_days: parseInt(days)
            }
        });
        
    } catch (error) {
        console.error('Error en cleanOldBackups:', error);
        res.status(500).json({
            success: false,
            message: 'Error al limpiar backups antiguos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  OBTENER INFORMACIÓN DE BACKUP                                             */
/* ========================================================================== */

const getBackupInfo = async (req, res) => {
    try {
        const { filename } = req.params;
        
        const backupPath = path.join(__dirname, '../../backups/database', filename);
        
        if (!fs.existsSync(backupPath)) {
            return res.status(404).json({
                success: false,
                message: 'Backup no encontrado'
            });
        }
        
        const stats = fs.statSync(backupPath);
        
        // Leer primeras líneas del archivo SQL para obtener metadatos
        const content = fs.readFileSync(backupPath, 'utf8');
        const lines = content.split('\n').slice(0, 20);
        
        res.status(200).json({
            success: true,
            data: {
                filename: filename,
                size: stats.size,
                size_formatted: backupManager.formatBytes(stats.size),
                created_at: stats.birthtime,
                modified_at: stats.mtime,
                preview: lines
            }
        });
        
    } catch (error) {
        console.error('Error en getBackupInfo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener información del backup',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  PROGRAMAR BACKUP AUTOMÁTICO                                               */
/* ========================================================================== */

const scheduleAutoBackup = async (req, res) => {
    try {
        const { enabled, time, retention_days } = req.body;
        
        // Validar hora (formato HH:MM)
        if (time && !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
            return res.status(400).json({
                success: false,
                message: 'Formato de hora inválido. Use HH:MM'
            });
        }
        
        // Guardar configuración (en archivo o base de datos)
        const configPath = path.join(__dirname, '../../backups/backup_config.json');
        const config = {
            enabled: enabled !== undefined ? enabled : true,
            time: time || '02:00',
            retention_days: retention_days || 30,
            last_updated: new Date().toISOString()
        };
        
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'CONFIGURAR_BACKUP_AUTO',
            detalle: `Backup automático: ${config.enabled ? 'Activado' : 'Desactivado'} - Hora: ${config.time} - Retención: ${config.retention_days} días`
        });
        
        res.status(200).json({
            success: true,
            message: 'Configuración de backup automático actualizada',
            data: config
        });
        
    } catch (error) {
        console.error('Error en scheduleAutoBackup:', error);
        res.status(500).json({
            success: false,
            message: 'Error al programar backup automático',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  OBTENER CONFIGURACIÓN DE BACKUP                                           */
/* ========================================================================== */

const getBackupConfig = async (req, res) => {
    try {
        const configPath = path.join(__dirname, '../../backups/backup_config.json');
        
        let config = {
            enabled: true,
            time: '02:00',
            retention_days: 30,
            last_backup: null
        };
        
        if (fs.existsSync(configPath)) {
            const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            config = { ...config, ...fileConfig };
        }
        
        // Obtener último backup
        const backups = await backupManager.listBackups();
        if (backups.length > 0) {
            config.last_backup = backups[0].created_at;
            config.last_backup_size = backups[0].size;
        }
        
        res.status(200).json({
            success: true,
            data: config
        });
        
    } catch (error) {
        console.error('Error en getBackupConfig:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener configuración de backup',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  EXPORTAR CONTROLADORES                                                    */
/* ========================================================================== */

module.exports = {
    createBackup,
    listBackups,
    downloadBackup,
    restoreBackup,
    deleteBackup,
    cleanOldBackups,
    getBackupInfo,
    scheduleAutoBackup,
    getBackupConfig
};