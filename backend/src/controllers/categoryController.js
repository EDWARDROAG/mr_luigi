// Archivo: categoryController.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: categoryController.js                                         */
/*  📁 UBICACIÓN: backend/src/controllers/categoryController.js               */
/*  🚀 MÓDULO: Controladores                                                  */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Controlador para la gestión de categorías. Permite administrar las       */
/*  categorías de productos (mantenimiento, venta, accesorios) y las         */
/*  subcategorías dentro del sistema CoreX.                                  */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Crear nueva categoría                                                  */
/*  ✅ Obtener todas las categorías                                           */
/*  ✅ Obtener categoría por ID                                               */
/*  ✅ Actualizar categoría existente                                         */
/*  ✅ Eliminar categoría (solo si no tiene productos asociados)              */
/*  ✅ Obtener categorías por tipo (venta/mantenimiento/accesorio)            */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • Category Model - Operaciones de base de datos                           */
/*  • Log Model - Registro de acciones                                        */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: categoryRoutes.js                                        */
/*  • Usa: Category, Log                                                      */
/*  • Relacionado con: Product (una categoría tiene muchos productos)        */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Solo administradores pueden crear, editar y eliminar categorías        */
/*  • No se puede eliminar una categoría que tenga productos asociados       */
/*  • Los tipos disponibles: 'venta', 'mantenimiento', 'accesorio'           */
/*  • Las categorías se usan para filtrar productos en el frontend           */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Implementación de todos los métodos CRUD                           */
/*      ✅ Validación de productos asociados antes de eliminar                */
/*      ✅ Filtrado por tipo de categoría                                     */
/*                                                                            */
/* ========================================================================== */

const Category = require('../models/Category');
const Product = require('../models/Product');
const Log = require('../models/Log');

/* ========================================================================== */
/*  CREAR CATEGORÍA                                                           */
/* ========================================================================== */

const createCategory = async (req, res) => {
    try {
        const { nombre, tipo, descripcion } = req.body;
        
        // Validar campos requeridos
        if (!nombre || !tipo) {
            return res.status(400).json({
                success: false,
                message: 'Los campos nombre y tipo son obligatorios'
            });
        }
        
        // Validar tipo
        const tiposPermitidos = ['venta', 'mantenimiento', 'accesorio'];
        if (!tiposPermitidos.includes(tipo)) {
            return res.status(400).json({
                success: false,
                message: `El tipo debe ser uno de: ${tiposPermitidos.join(', ')}`
            });
        }
        
        // Verificar si ya existe una categoría con el mismo nombre
        const existingCategory = await Category.findByName(nombre);
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una categoría con ese nombre'
            });
        }
        
        // Crear categoría
        const category = await Category.create({
            nombre,
            tipo,
            descripcion: descripcion || ''
        });
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'CREAR_CATEGORIA',
            detalle: `Categoría creada: ${nombre} (Tipo: ${tipo}, ID: ${category.id})`
        });
        
        res.status(201).json({
            success: true,
            message: 'Categoría creada exitosamente',
            data: category
        });
        
    } catch (error) {
        console.error('Error en createCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear la categoría',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  OBTENER TODAS LAS CATEGORÍAS                                             */
/* ========================================================================== */

const getCategories = async (req, res) => {
    try {
        const { tipo } = req.query;
        
        let categories;
        if (tipo) {
            // Validar tipo
            const tiposPermitidos = ['venta', 'mantenimiento', 'accesorio'];
            if (!tiposPermitidos.includes(tipo)) {
                return res.status(400).json({
                    success: false,
                    message: `El tipo debe ser uno de: ${tiposPermitidos.join(', ')}`
                });
            }
            categories = await Category.findByType(tipo);
        } else {
            categories = await Category.findAll();
        }
        
        res.status(200).json({
            success: true,
            data: categories,
            total: categories.length
        });
        
    } catch (error) {
        console.error('Error en getCategories:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las categorías',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  OBTENER CATEGORÍA POR ID                                                  */
/* ========================================================================== */

const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const category = await Category.findById(parseInt(id));
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        
        // Obtener cantidad de productos en esta categoría
        const products = await Product.findAll({ categoria_id: parseInt(id) }, 1, 1000);
        
        res.status(200).json({
            success: true,
            data: {
                ...category,
                total_productos: products.pagination.total
            }
        });
        
    } catch (error) {
        console.error('Error en getCategoryById:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la categoría',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  ACTUALIZAR CATEGORÍA                                                      */
/* ========================================================================== */

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, tipo, descripcion } = req.body;
        
        // Verificar si la categoría existe
        const existingCategory = await Category.findById(parseInt(id));
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        
        // Validar tipo si se proporciona
        if (tipo) {
            const tiposPermitidos = ['venta', 'mantenimiento', 'accesorio'];
            if (!tiposPermitidos.includes(tipo)) {
                return res.status(400).json({
                    success: false,
                    message: `El tipo debe ser uno de: ${tiposPermitidos.join(', ')}`
                });
            }
        }
        
        // Verificar nombre duplicado (si se cambia el nombre)
        if (nombre && nombre !== existingCategory.nombre) {
            const duplicateCategory = await Category.findByName(nombre);
            if (duplicateCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe una categoría con ese nombre'
                });
            }
        }
        
        // Preparar datos de actualización
        const updateData = {};
        if (nombre !== undefined) updateData.nombre = nombre;
        if (tipo !== undefined) updateData.tipo = tipo;
        if (descripcion !== undefined) updateData.descripcion = descripcion;
        
        const category = await Category.update(parseInt(id), updateData);
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'ACTUALIZAR_CATEGORIA',
            detalle: `Categoría actualizada: ${existingCategory.nombre} -> ${nombre || existingCategory.nombre} (ID: ${id})`
        });
        
        res.status(200).json({
            success: true,
            message: 'Categoría actualizada exitosamente',
            data: category
        });
        
    } catch (error) {
        console.error('Error en updateCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la categoría',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  ELIMINAR CATEGORÍA                                                        */
/* ========================================================================== */

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar si la categoría existe
        const existingCategory = await Category.findById(parseInt(id));
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        
        // Verificar si tiene productos asociados
        const products = await Product.findAll({ categoria_id: parseInt(id) }, 1, 1);
        if (products.pagination.total > 0) {
            return res.status(400).json({
                success: false,
                message: `No se puede eliminar la categoría porque tiene ${products.pagination.total} producto(s) asociado(s)`
            });
        }
        
        await Category.remove(parseInt(id));
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'ELIMINAR_CATEGORIA',
            detalle: `Categoría eliminada: ${existingCategory.nombre} (ID: ${id})`
        });
        
        res.status(200).json({
            success: true,
            message: 'Categoría eliminada exitosamente'
        });
        
    } catch (error) {
        console.error('Error en deleteCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la categoría',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  OBTENER CATEGORÍAS CON CONTEO DE PRODUCTOS                                */
/* ========================================================================== */

const getCategoriesWithCount = async (req, res) => {
    try {
        const categories = await Category.findAllWithProductCount();
        
        res.status(200).json({
            success: true,
            data: categories
        });
        
    } catch (error) {
        console.error('Error en getCategoriesWithCount:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las categorías con conteo',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  EXPORTAR CONTROLADORES                                                    */
/* ========================================================================== */

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    getCategoriesWithCount
};