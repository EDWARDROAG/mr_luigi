// Archivo: uploadController.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: uploadController.js                                           */
/*  📁 UBICACIÓN: backend/src/controllers/uploadController.js                 */
/*  🚀 MÓDULO: Controladores                                                  */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Controlador para la gestión de archivos subidos. Maneja la carga,        */
/*  optimización y eliminación de imágenes de productos y comprobantes de    */
/*  pago. También gestiona la subida de comprobantes de transferencia        */
/*  desde el panel del cajero.                                               */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Subir imagen de producto con optimización automática                   */
/*  ✅ Subir comprobante de transferencia                                     */
/*  ✅ Eliminar archivos subidos                                              */
/*  ✅ Obtener URL pública de archivo                                         */
/*  ✅ Validación de tipos de archivo y tamaño                                */
/*  ✅ Optimización de imágenes (redimensionamiento, compresión)              */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • imageOptimizer - Optimización de imágenes                               */
/*  • Log Model - Registro de acciones                                        */
/*  • fs - Manejo de sistema de archivos                                      */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: uploadRoutes.js                                          */
/*  • Usa: imageOptimizer, Log                                                */
/*  • Relacionado con: Product (imagen del producto)                         */
/*  • Relacionado con: Sale (comprobante de pago)                            */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Solo administradores pueden subir imágenes de productos                */
/*  • Admin y cajero pueden subir comprobantes                               */
/*  • Tamaño máximo: 5MB                                                     */
/*  • Formatos permitidos: jpg, jpeg, png, webp                              */
/*  • Las imágenes se redimensionan a 800px de ancho máximo                   */
/*  • Los comprobantes se guardan con marca de tiempo para evitar colisiones */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Subida de imágenes de productos                                    */
/*      ✅ Subida de comprobantes de transferencia                            */
/*      ✅ Eliminación de archivos                                            */
/*      ✅ Optimización automática                                            */
/*                                                                            */
/* ========================================================================== */

const { optimizeImage, deleteImage, uploadReceipt } = require('../utils/imageOptimizer');
const Log = require('../models/Log');
const fs = require('fs');
const path = require('path');

/* ========================================================================== */
/*  SUBIR IMAGEN DE PRODUCTO                                                  */
/* ========================================================================== */

const uploadProductImage = async (req, res) => {
    try {
        // Verificar que se haya subido un archivo
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se ha subido ningún archivo'
            });
        }
        
        // Optimizar la imagen
        const optimizedPath = await optimizeImage(req.file, 'productos');
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'SUBIR_IMAGEN_PRODUCTO',
            detalle: `Imagen de producto subida: ${optimizedPath}`
        });
        
        // Generar URL pública
        const publicUrl = `/uploads/productos/${path.basename(optimizedPath)}`;
        
        res.status(200).json({
            success: true,
            message: 'Imagen subida exitosamente',
            data: {
                url: publicUrl,
                filename: path.basename(optimizedPath)
            }
        });
        
    } catch (error) {
        console.error('Error en uploadProductImage:', error);
        
        // Limpiar archivo subido si hubo error
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error al limpiar archivo:', unlinkError);
            }
        }
        
        res.status(500).json({
            success: false,
            message: 'Error al subir la imagen',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  SUBIR COMPROBANTE DE TRANSFERENCIA                                        */
/* ========================================================================== */

const uploadTransferReceipt = async (req, res) => {
    try {
        // Verificar que se haya subido un archivo
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se ha subido ningún comprobante'
            });
        }
        
        // Validar tipo de archivo (solo imágenes)
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            // Limpiar archivo
            if (req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'Formato no permitido. Use JPG, PNG o WEBP'
            });
        }
        
        // Validar tamaño (máximo 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (req.file.size > maxSize) {
            // Limpiar archivo
            if (req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'El archivo es demasiado grande. Máximo 5MB'
            });
        }
        
        // Subir y optimizar comprobante
        const receiptPath = await uploadReceipt(req.file, 'comprobantes');
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'SUBIR_COMPROBANTE',
            detalle: `Comprobante de transferencia subido: ${receiptPath}`
        });
        
        // Generar URL pública
        const publicUrl = `/uploads/comprobantes/${path.basename(receiptPath)}`;
        
        res.status(200).json({
            success: true,
            message: 'Comprobante subido exitosamente',
            data: {
                url: publicUrl,
                filename: path.basename(receiptPath)
            }
        });
        
    } catch (error) {
        console.error('Error en uploadTransferReceipt:', error);
        
        // Limpiar archivo subido si hubo error
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error al limpiar archivo:', unlinkError);
            }
        }
        
        res.status(500).json({
            success: false,
            message: 'Error al subir el comprobante',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  ELIMINAR ARCHIVO                                                          */
/* ========================================================================== */

const deleteFile = async (req, res) => {
    try {
        const { filename, folder } = req.body;
        
        if (!filename || !folder) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere filename y folder'
            });
        }
        
        // Validar carpeta permitida
        const allowedFolders = ['productos', 'comprobantes'];
        if (!allowedFolders.includes(folder)) {
            return res.status(400).json({
                success: false,
                message: 'Carpeta no permitida'
            });
        }
        
        const filePath = path.join(__dirname, '../../uploads', folder, filename);
        
        // Verificar si el archivo existe
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Archivo no encontrado'
            });
        }
        
        // Eliminar archivo
        fs.unlinkSync(filePath);
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'ELIMINAR_ARCHIVO',
            detalle: `Archivo eliminado: ${folder}/${filename}`
        });
        
        res.status(200).json({
            success: true,
            message: 'Archivo eliminado exitosamente'
        });
        
    } catch (error) {
        console.error('Error en deleteFile:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el archivo',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  OBTENER URL DE ARCHIVO                                                    */
/* ========================================================================== */

const getFileUrl = async (req, res) => {
    try {
        const { filename, folder } = req.params;
        
        // Validar carpeta permitida
        const allowedFolders = ['productos', 'comprobantes'];
        if (!allowedFolders.includes(folder)) {
            return res.status(400).json({
                success: false,
                message: 'Carpeta no permitida'
            });
        }
        
        const filePath = path.join(__dirname, '../../uploads', folder, filename);
        
        // Verificar si el archivo existe
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Archivo no encontrado'
            });
        }
        
        const publicUrl = `/uploads/${folder}/${filename}`;
        
        res.status(200).json({
            success: true,
            data: {
                url: publicUrl,
                filename: filename,
                folder: folder
            }
        });
        
    } catch (error) {
        console.error('Error en getFileUrl:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la URL del archivo',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  SUBIR IMAGEN MÚLTIPLE (PARA FUTURO)                                       */
/* ========================================================================== */

const uploadMultipleImages = async (req, res) => {
    try {
        // Verificar que se hayan subido archivos
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se han subido archivos'
            });
        }
        
        const optimizedImages = [];
        
        // Optimizar cada imagen
        for (const file of req.files) {
            try {
                const optimizedPath = await optimizeImage(file, 'productos');
                const publicUrl = `/uploads/productos/${path.basename(optimizedPath)}`;
                optimizedImages.push({
                    url: publicUrl,
                    filename: path.basename(optimizedPath)
                });
            } catch (err) {
                console.error('Error optimizando imagen:', err);
                // Continuar con las demás imágenes
            }
        }
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'SUBIR_MULTIPLES_IMAGENES',
            detalle: `${optimizedImages.length} imágenes subidas`
        });
        
        res.status(200).json({
            success: true,
            message: `${optimizedImages.length} imágenes subidas exitosamente`,
            data: {
                images: optimizedImages
            }
        });
        
    } catch (error) {
        console.error('Error en uploadMultipleImages:', error);
        
        // Limpiar archivos subidos si hubo error
        if (req.files) {
            for (const file of req.files) {
                if (file.path) {
                    try {
                        fs.unlinkSync(file.path);
                    } catch (unlinkError) {
                        console.error('Error al limpiar archivo:', unlinkError);
                    }
                }
            }
        }
        
        res.status(500).json({
            success: false,
            message: 'Error al subir las imágenes',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  EXPORTAR CONTROLADORES                                                    */
/* ========================================================================== */

module.exports = {
    uploadProductImage,
    uploadTransferReceipt,
    deleteFile,
    getFileUrl,
    uploadMultipleImages
};