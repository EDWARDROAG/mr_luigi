// Archivo: backupRoutes.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: backupRoutes.js                                               */
/*  📁 UBICACIÓN: backend/src/routes/backupRoutes.js                          */
/*  🚀 MÓDULO: Rutas                                                          */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Rutas para la gestión de respaldos (backups) del sistema. Permite        */
/*  crear, listar, descargar, restaurar y eliminar copias de seguridad.      */
/*  Solo accesible por administradores.                                      */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Crear nuevo backup (base de datos + archivos)                          */
/*  ✅ Listar backups disponibles                                             */
/*  ✅ Descargar backup                                                       */
/*  ✅ Restaurar backup                                                       */
/*  ✅ Eliminar backup                                                        */
/*  ✅ Limpiar backups antiguos automáticamente                               */
/*  ✅ Obtener información de un backup                                       */
/*  ✅ Configurar backup automático programado                                */
/*  ✅ Obtener configuración actual                                           */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • backupController - Lógica de backups                                    */
/*  • authMiddleware - Verificación de token                                  */
/*  • roleMiddleware - Verificación de roles                                  */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: server.js                                                */
/*  • Usa: backupController                                                   */
/*  • Prefix: /api/backup                                                     */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Solo administradores pueden gestionar backups                          */
/*  • Los backups se guardan en /backups/database/                            */
/*  • Restaurar backup puede sobrescribir datos actuales                      */
/*  • Se recomienda crear backup antes de restaurar                           */
/*  • Retención predeterminada: 30 días                                       */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Creación de backups                                                */
/*      ✅ Listado y descarga                                                 */
/*      ✅ Restauración                                                       */
/*      ✅ Eliminación                                                        */
/*      ✅ Limpieza automática                                                */
/*      ✅ Backup automático programado                                       */
/*                                                                            */
/* ========================================================================== */

const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

/* ========================================================================== */
/*  RUTAS DE BACKUPS (SOLO ADMINISTRADORES)                                   */
/* ========================================================================== */

/**
 * @route   POST /api/backup/create
 * @desc    Crear un nuevo backup completo
 * @access  Private (Admin)
 * @body    { include_uploads (boolean) }
 * @returns { filename, path, size, created_at }
 */
router.post(
    '/create',
    authMiddleware,
    isAdmin,
    backupController.createBackup
);

/**
 * @route   GET /api/backup/list
 * @desc    Listar todos los backups disponibles
 * @access  Private (Admin)
 * @returns { backups, total }
 */
router.get(
    '/list',
    authMiddleware,
    isAdmin,
    backupController.listBackups
);

/**
 * @route   GET /api/backup/download/:filename
 * @desc    Descargar un backup específico
 * @access  Private (Admin)
 * @param   { filename }
 * @returns { file (SQL) }
 */
router.get(
    '/download/:filename',
    authMiddleware,
    isAdmin,
    backupController.downloadBackup
);

/**
 * @route   POST /api/backup/restore
 * @desc    Restaurar un backup (base de datos)
 * @access  Private (Admin)
 * @body    { filename, restore_uploads (boolean) }
 * @returns { message }
 */
router.post(
    '/restore',
    authMiddleware,
    isAdmin,
    backupController.restoreBackup
);

/**
 * @route   DELETE /api/backup/delete/:filename
 * @desc    Eliminar un backup específico
 * @access  Private (Admin)
 * @param   { filename }
 * @returns { message }
 */
router.delete(
    '/delete/:filename',
    authMiddleware,
    isAdmin,
    backupController.deleteBackup
);

/**
 * @route   DELETE /api/backup/clean
 * @desc    Limpiar backups antiguos (retención configurable)
 * @access  Private (Admin)
 * @query   { days (retención en días, default 30) }
 * @returns { deleted_count, retention_days }
 */
router.delete(
    '/clean',
    authMiddleware,
    isAdmin,
    backupController.cleanOldBackups
);

/**
 * @route   GET /api/backup/info/:filename
 * @desc    Obtener información detallada de un backup
 * @access  Private (Admin)
 * @param   { filename }
 * @returns { filename, size, created_at, preview }
 */
router.get(
    '/info/:filename',
    authMiddleware,
    isAdmin,
    backupController.getBackupInfo
);

/**
 * @route   POST /api/backup/schedule
 * @desc    Configurar backup automático programado
 * @access  Private (Admin)
 * @body    { enabled, time, retention_days }
 * @returns { config }
 */
router.post(
    '/schedule',
    authMiddleware,
    isAdmin,
    backupController.scheduleAutoBackup
);

/**
 * @route   GET /api/backup/config
 * @desc    Obtener configuración actual de backups
 * @access  Private (Admin)
 * @returns { enabled, time, retention_days, last_backup }
 */
router.get(
    '/config',
    authMiddleware,
    isAdmin,
    backupController.getBackupConfig
);

/* ========================================================================== */
/*  EXPORTAR ROUTER                                                           */
/* ========================================================================== */

module.exports = router;