// Archivo: saleController.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: saleController.js                                             */
/*  📁 UBICACIÓN: backend/src/controllers/saleController.js                   */
/*  🚀 MÓDULO: Controladores                                                  */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Controlador para la gestión de ventas. Maneja el proceso completo de     */
/*  venta incluyendo carrito de múltiples productos, métodos de pago,        */
/*  subida de comprobantes y generación de facturas.                         */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Registrar nueva venta (múltiples productos)                            */
/*  ✅ Obtener todas las ventas (con filtros y paginación)                    */
/*  ✅ Obtener venta por ID con detalles                                      */
/*  ✅ Obtener ventas por vendedor (cajero/admin)                             */
/*  ✅ Cancelar venta                                                         */
/*  ✅ Subir comprobante de transferencia                                     */
/*  ✅ Generar factura en PDF para impresión térmica 80mm                     */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • Sale Model - Operaciones de base de datos                               */
/*  • SaleItem Model - Ítems de venta                                         */
/*  • Product Model - Actualizar stock                                        */
/*  • Log Model - Registro de acciones                                        */
/*  • invoiceGenerator - Generación de facturas PDF                           */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: saleRoutes.js                                            */
/*  • Usa: Sale, SaleItem, Product, Log, invoiceGenerator                     */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Admin y cajero pueden registrar ventas                                  */
/*  • Una venta puede tener múltiples productos                               */
/*  • Transferencia requiere comprobante subido                               */
/*  • La factura se genera automáticamente en formato 80mm                    */
/*  • Al registrar venta, el stock del producto se actualiza a 0             */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Implementación de venta con múltiples productos                    */
/*      ✅ Subida de comprobantes de transferencia                            */
/*      ✅ Generación de factura PDF                                          */
/*      ✅ Filtros por vendedor y método de pago                              */
/*                                                                            */
/* ========================================================================== */

const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const Product = require('../models/Product');
const Log = require('../models/Log');
const { generateInvoice, generateInvoiceHTML } = require('../utils/invoiceGenerator');
const { uploadReceipt, deleteReceipt } = require('../utils/imageOptimizer');
const path = require('path');
const fs = require('fs');

/* ========================================================================== */
/*  REGISTRAR NUEVA VENTA                                                     */
/* ========================================================================== */

const createSale = async (req, res) => {
    try {
        const {
            items,
            cliente_nombre,
            cliente_telefono,
            metodo_pago,
            total
        } = req.body;
        
        // Validar campos requeridos
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe incluir al menos un producto en la venta'
            });
        }
        
        if (!metodo_pago || !['efectivo', 'transferencia'].includes(metodo_pago)) {
            return res.status(400).json({
                success: false,
                message: 'Método de pago inválido. Debe ser "efectivo" o "transferencia"'
            });
        }
        
        // Validar que todos los productos existan y estén disponibles
        let totalCalculado = 0;
        const itemsValidados = [];
        
        for (const item of items) {
            const product = await Product.findById(item.producto_id);
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Producto con ID ${item.producto_id} no encontrado`
                });
            }
            
            if (product.stock === 0) {
                return res.status(400).json({
                    success: false,
                    message: `El producto "${product.nombre}" ya está vendido o no disponible`
                });
            }
            
            const subtotal = product.precio * item.cantidad;
            totalCalculado += subtotal;
            
            itemsValidados.push({
                producto_id: product.id,
                cantidad: item.cantidad,
                precio_unitario: product.precio,
                subtotal
            });
        }
        
        // Validar total (opcional, permite redondeo)
        if (total && Math.abs(totalCalculado - total) > 0.01) {
            return res.status(400).json({
                success: false,
                message: `El total no coincide. Calculado: ${totalCalculado}, Enviado: ${total}`
            });
        }
        
        // Crear la venta
        const comprobante_url = req.file ? await uploadReceipt(req.file, 'comprobantes') : null;
        
        const sale = await Sale.create({
            vendedor_id: req.user.id,
            cliente_nombre: cliente_nombre || null,
            cliente_telefono: cliente_telefono || null,
            metodo_pago,
            comprobante_url: metodo_pago === 'transferencia' ? comprobante_url : null,
            total: totalCalculado
        });
        
        // Crear items de venta y actualizar stock
        for (const item of itemsValidados) {
            await SaleItem.create({
                sale_id: sale.id,
                producto_id: item.producto_id,
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario,
                subtotal: item.subtotal
            });
            
            // Marcar producto como vendido
            await Product.markAsSold(item.producto_id);
        }
        
        // Generar factura
        const saleWithDetails = await Sale.findById(sale.id);
        const invoicePath = await generateInvoice(saleWithDetails);
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'CREAR_VENTA',
            detalle: `Venta creada #${sale.factura_numero} - Total: $${totalCalculado} - Método: ${metodo_pago} - ${items.length} producto(s)`
        });
        
        res.status(201).json({
            success: true,
            message: 'Venta registrada exitosamente',
            data: {
                sale: saleWithDetails,
                factura_pdf: invoicePath
            }
        });
        
    } catch (error) {
        console.error('Error en createSale:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar la venta',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  OBTENER TODAS LAS VENTAS (CON FILTROS Y PAGINACIÓN)                       */
/* ========================================================================== */

const getSales = async (req, res) => {
    try {
        const {
            vendedor_id,
            metodo_pago,
            fecha_desde,
            fecha_hasta,
            page = 1,
            limit = 20
        } = req.query;
        
        // Construir filtros
        const filters = {};
        if (vendedor_id) filters.vendedor_id = parseInt(vendedor_id);
        if (metodo_pago) filters.metodo_pago = metodo_pago;
        if (fecha_desde) filters.fecha_desde = fecha_desde;
        if (fecha_hasta) filters.fecha_hasta = fecha_hasta;
        
        // Si es cajero, solo ver sus propias ventas
        if (req.user.role === 'cajero') {
            filters.vendedor_id = req.user.id;
        }
        
        const result = await Sale.findAll(filters, parseInt(page), parseInt(limit));
        
        res.status(200).json({
            success: true,
            data: result.sales,
            pagination: result.pagination
        });
        
    } catch (error) {
        console.error('Error en getSales:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las ventas',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  OBTENER VENTA POR ID                                                      */
/* ========================================================================== */

const getSaleById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const sale = await Sale.findById(parseInt(id));
        
        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Venta no encontrada'
            });
        }
        
        // Verificar permisos: cajero solo puede ver sus propias ventas
        if (req.user.role === 'cajero' && sale.vendedor_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tiene permiso para ver esta venta'
            });
        }
        
        res.status(200).json({
            success: true,
            data: sale
        });
        
    } catch (error) {
        console.error('Error en getSaleById:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la venta',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  CANCELAR VENTA                                                            */
/* ========================================================================== */

const cancelSale = async (req, res) => {
    try {
        const { id } = req.params;
        const { motivo } = req.body;
        
        // Verificar si la venta existe
        const existingSale = await Sale.findById(parseInt(id));
        if (!existingSale) {
            return res.status(404).json({
                success: false,
                message: 'Venta no encontrada'
            });
        }
        
        // Verificar si ya está cancelada
        if (existingSale.estado === 'cancelada') {
            return res.status(400).json({
                success: false,
                message: 'La venta ya está cancelada'
            });
        }
        
        // Solo admin puede cancelar ventas
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden cancelar ventas'
            });
        }
        
        // Restaurar stock de los productos
        for (const item of existingSale.items) {
            // Actualizar stock a 1 (disponible) y eliminar vendido_en
            await Sale.restoreProductStock(item.producto_id);
        }
        
        // Cancelar venta
        const sale = await Sale.cancel(parseInt(id), motivo || 'Cancelada por administrador');
        
        // Eliminar comprobante si existe
        if (existingSale.comprobante_url) {
            await deleteReceipt(existingSale.comprobante_url);
        }
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'CANCELAR_VENTA',
            detalle: `Venta #${existingSale.factura_numero} cancelada. Motivo: ${motivo || 'No especificado'}`
        });
        
        res.status(200).json({
            success: true,
            message: 'Venta cancelada exitosamente',
            data: sale
        });
        
    } catch (error) {
        console.error('Error en cancelSale:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cancelar la venta',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  SUBIR COMPROBANTE DE TRANSFERENCIA                                        */
/* ========================================================================== */

const uploadTransferReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar si la venta existe
        const existingSale = await Sale.findById(parseInt(id));
        if (!existingSale) {
            return res.status(404).json({
                success: false,
                message: 'Venta no encontrada'
            });
        }
        
        // Verificar método de pago
        if (existingSale.metodo_pago !== 'transferencia') {
            return res.status(400).json({
                success: false,
                message: 'Esta venta no es por transferencia'
            });
        }
        
        // Verificar si ya tiene comprobante
        if (existingSale.comprobante_url) {
            return res.status(400).json({
                success: false,
                message: 'Esta venta ya tiene un comprobante asociado'
            });
        }
        
        // Verificar que se subió un archivo
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Debe subir un comprobante'
            });
        }
        
        // Subir comprobante
        const comprobante_url = await uploadReceipt(req.file, 'comprobantes');
        
        // Actualizar venta
        const sale = await Sale.updateReceipt(parseInt(id), comprobante_url);
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'SUBIR_COMPROBANTE',
            detalle: `Comprobante subido para venta #${existingSale.factura_numero}`
        });
        
        res.status(200).json({
            success: true,
            message: 'Comprobante subido exitosamente',
            data: sale
        });
        
    } catch (error) {
        console.error('Error en uploadTransferReceipt:', error);
        res.status(500).json({
            success: false,
            message: 'Error al subir el comprobante',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  GENERAR FACTURA PDF                                                       */
/* ========================================================================== */

const generateSaleInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar si la venta existe
        const sale = await Sale.findById(parseInt(id));
        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Venta no encontrada'
            });
        }
        
        // Verificar permisos
        if (req.user.role === 'cajero' && sale.vendedor_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tiene permiso para generar esta factura'
            });
        }
        
        // Generar factura
        const invoicePath = await generateInvoice(sale);
        
        // Enviar archivo PDF
        res.download(invoicePath, `factura_${sale.factura_numero}.pdf`, (err) => {
            if (err) {
                console.error('Error al descargar factura:', err);
            }
            // Eliminar archivo temporal después de enviar
            setTimeout(() => {
                if (fs.existsSync(invoicePath)) {
                    fs.unlinkSync(invoicePath);
                }
            }, 5000);
        });
        
    } catch (error) {
        console.error('Error en generateSaleInvoice:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar la factura',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  OBTENER RESUMEN DE VENTAS POR VENDEDOR                                    */
/* ========================================================================== */

const getSalesSummaryBySeller = async (req, res) => {
    try {
        const { fecha_desde, fecha_hasta, vendedor_id } = req.query;
        
        // Si es cajero, solo sus propias ventas
        let vendedorIdFilter = vendedor_id;
        if (req.user.role === 'cajero') {
            vendedorIdFilter = req.user.id;
        }
        
        const summary = await Sale.getSummaryBySeller({
            vendedor_id: vendedorIdFilter,
            fecha_desde,
            fecha_hasta
        });
        
        res.status(200).json({
            success: true,
            data: summary
        });
        
    } catch (error) {
        console.error('Error en getSalesSummaryBySeller:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el resumen de ventas',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  EXPORTAR CONTROLADORES                                                    */
/* ========================================================================== */

module.exports = {
    createSale,
    getSales,
    getSaleById,
    cancelSale,
    uploadTransferReceipt,
    generateSaleInvoice,
    getSalesSummaryBySeller
};