// Archivo: productController.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: productController.js                                          */
/*  📁 UBICACIÓN: backend/src/controllers/productController.js                */
/*  🚀 MÓDULO: Controladores                                                  */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Controlador para la gestión de productos. Maneja todas las operaciones   */
/*  CRUD, búsqueda con filtros, paginación, y actualización masiva.          */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Crear nuevo producto con imagen                                        */
/*  ✅ Obtener todos los productos (con filtros y paginación)                 */
/*  ✅ Obtener producto por ID                                                */
/*  ✅ Actualizar producto existente                                          */
/*  ✅ Eliminar producto                                                      */
/*  ✅ Marcar producto como vendido                                           */
/*  ✅ Actualización masiva de precios                                        */
/*  ✅ Obtener productos destacados para el home                              */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • Product Model - Operaciones de base de datos                            */
/*  • Log Model - Registro de acciones                                        */
/*  • imageOptimizer - Optimización de imágenes subidas                       */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: productRoutes.js                                         */
/*  • Usa: Product, Log, imageOptimizer                                       */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Solo administradores pueden crear, editar y eliminar productos         */
/*  • Cajeros pueden ver productos y marcar como vendidos                     */
/*  • Las imágenes se optimizan automáticamente                               */
/*  • El stock: 1=disponible, 0=vendido/agotado                              */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Implementación de todos los métodos CRUD                           */
/*      ✅ Filtros y paginación                                               */
/*      ✅ Actualización masiva de precios                                    */
/*                                                                            */
/* ========================================================================== */

const Product = require('../models/Product');
const Log = require('../models/Log');
const { optimizeImage, deleteImage } = require('../utils/imageOptimizer');
const path = require('path');

/* ========================================================================== */
/*  CREAR PRODUCTO                                                            */
/* ========================================================================== */

const createProduct = async (req, res) => {
    try {
        const { nombre, descripcion, precio, condicion, categoria_id, destacado } = req.body;
        
        // Validar campos requeridos
        if (!nombre || !precio || !condicion || !categoria_id) {
            return res.status(400).json({
                success: false,
                message: 'Los campos nombre, precio, condición y categoría son obligatorios'
            });
        }
        
        // Validar condición
        if (!['nuevo', 'segunda'].includes(condicion)) {
            return res.status(400).json({
                success: false,
                message: 'La condición debe ser "nuevo" o "segunda"'
            });
        }
        
        // Procesar imagen si existe
        let imagen_url = null;
        if (req.file) {
            imagen_url = await optimizeImage(req.file, 'productos');
        }
        
        // Crear producto
        const product = await Product.create({
            nombre,
            descripcion: descripcion || '',
            precio: parseFloat(precio),
            condicion,
            categoria_id: parseInt(categoria_id),
            imagen_url,
            destacado: destacado === 'true' || destacado === true
        });
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'CREAR_PRODUCTO',
            detalle: `Producto creado: ${nombre} (ID: ${product.id})`
        });
        
        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: product
        });
        
    } catch (error) {
        console.error('Error en createProduct:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el producto',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  OBTENER TODOS LOS PRODUCTOS (CON FILTROS Y PAGINACIÓN)                    */
/* ========================================================================== */

const getProducts = async (req, res) => {
    try {
        const {
            categoria_id,
            condicion,
            destacado,
            search,
            page = 1,
            limit = 20
        } = req.query;
        
        // Construir filtros
        const filters = {};
        if (categoria_id) filters.categoria_id = parseInt(categoria_id);
        if (condicion) filters.condicion = condicion;
        if (destacado !== undefined) filters.destacado = destacado === 'true';
        if (search) filters.search = search;
        
        const result = await Product.findAll(filters, parseInt(page), parseInt(limit));
        
        res.status(200).json({
            success: true,
            data: result.products,
            pagination: result.pagination
        });
        
    } catch (error) {
        console.error('Error en getProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los productos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  OBTENER PRODUCTO POR ID                                                   */
/* ========================================================================== */

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findById(parseInt(id));
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        res.status(200).json({
            success: true,
            data: product
        });
        
    } catch (error) {
        console.error('Error en getProductById:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el producto',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  ACTUALIZAR PRODUCTO                                                       */
/* ========================================================================== */

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, condicion, categoria_id, destacado, stock } = req.body;
        
        // Verificar si el producto existe
        const existingProduct = await Product.findById(parseInt(id));
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        // Procesar nueva imagen si se subió
        let imagen_url = existingProduct.imagen_url;
        if (req.file) {
            // Eliminar imagen anterior si existe
            if (existingProduct.imagen_url) {
                await deleteImage(existingProduct.imagen_url);
            }
            imagen_url = await optimizeImage(req.file, 'productos');
        }
        
        // Preparar datos de actualización
        const updateData = {};
        if (nombre !== undefined) updateData.nombre = nombre;
        if (descripcion !== undefined) updateData.descripcion = descripcion;
        if (precio !== undefined) updateData.precio = parseFloat(precio);
        if (condicion !== undefined) updateData.condicion = condicion;
        if (categoria_id !== undefined) updateData.categoria_id = parseInt(categoria_id);
        if (destacado !== undefined) updateData.destacado = destacado === 'true' || destacado === true;
        if (stock !== undefined) updateData.stock = parseInt(stock);
        if (req.file) updateData.imagen_url = imagen_url;
        
        const product = await Product.update(parseInt(id), updateData);
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'ACTUALIZAR_PRODUCTO',
            detalle: `Producto actualizado: ${nombre || existingProduct.nombre} (ID: ${id})`
        });
        
        res.status(200).json({
            success: true,
            message: 'Producto actualizado exitosamente',
            data: product
        });
        
    } catch (error) {
        console.error('Error en updateProduct:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el producto',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  MARCAR PRODUCTO COMO VENDIDO                                              */
/* ========================================================================== */

const markProductAsSold = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar si el producto existe
        const existingProduct = await Product.findById(parseInt(id));
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        // Verificar si ya está vendido
        if (existingProduct.stock === 0) {
            return res.status(400).json({
                success: false,
                message: 'El producto ya está marcado como vendido'
            });
        }
        
        const product = await Product.markAsSold(parseInt(id));
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'MARCAR_VENDIDO',
            detalle: `Producto marcado como vendido: ${existingProduct.nombre} (ID: ${id})`
        });
        
        res.status(200).json({
            success: true,
            message: 'Producto marcado como vendido',
            data: product
        });
        
    } catch (error) {
        console.error('Error en markProductAsSold:', error);
        res.status(500).json({
            success: false,
            message: 'Error al marcar el producto como vendido',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  ELIMINAR PRODUCTO                                                         */
/* ========================================================================== */

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar si el producto existe
        const existingProduct = await Product.findById(parseInt(id));
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        // Eliminar imagen asociada si existe
        if (existingProduct.imagen_url) {
            await deleteImage(existingProduct.imagen_url);
        }
        
        await Product.remove(parseInt(id));
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'ELIMINAR_PRODUCTO',
            detalle: `Producto eliminado: ${existingProduct.nombre} (ID: ${id})`
        });
        
        res.status(200).json({
            success: true,
            message: 'Producto eliminado exitosamente'
        });
        
    } catch (error) {
        console.error('Error en deleteProduct:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el producto',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  ACTUALIZACIÓN MASIVA DE PRECIOS                                           */
/* ========================================================================== */

const bulkUpdatePrices = async (req, res) => {
    try {
        const { percentage } = req.body;
        
        // Validar porcentaje
        if (percentage === undefined || isNaN(parseFloat(percentage))) {
            return res.status(400).json({
                success: false,
                message: 'El porcentaje de actualización es requerido'
            });
        }
        
        const updatedProducts = await Product.bulkUpdatePrice(parseFloat(percentage));
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'ACTUALIZAR_PRECIOS_MASIVO',
            detalle: `Actualización masiva de precios: ${percentage}% - ${updatedProducts.length} productos afectados`
        });
        
        res.status(200).json({
            success: true,
            message: `Precios actualizados exitosamente (${updatedProducts.length} productos afectados)`,
            data: updatedProducts
        });
        
    } catch (error) {
        console.error('Error en bulkUpdatePrices:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar los precios',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  OBTENER PRODUCTOS DESTACADOS                                              */
/* ========================================================================== */

const getDestacados = async (req, res) => {
    try {
        const { limit = 8 } = req.query;
        
        const products = await Product.getDestacados(parseInt(limit));
        
        res.status(200).json({
            success: true,
            data: products
        });
        
    } catch (error) {
        console.error('Error en getDestacados:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos destacados',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  EXPORTAR CONTROLADORES                                                    */
/* ========================================================================== */

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    markProductAsSold,
    deleteProduct,
    bulkUpdatePrices,
    getDestacados
};