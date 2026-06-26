// Archivo: invoiceGenerator.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: invoiceGenerator.js                                           */
/*  📁 UBICACIÓN: backend/src/utils/invoiceGenerator.js                       */
/*  🚀 MÓDULO: Utilidades                                                     */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Utilidad para la generación de facturas en PDF para impresión térmica    */
/*  de 80mm. Genera tickets de venta formateados para impresoras térmicas    */
/*  de punto de venta (POS).                                                 */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Generar factura en formato PDF para impresión 80mm                     */
/*  ✅ Formatear ticket con encabezado, productos y totales                   */
/*  ✅ Soporte para múltiples métodos de pago (efectivo/transferencia)        */
/*  ✅ Incluir comprobante de transferencia si existe                         */
/*  ✅ Generar HTML para vista previa                                         */
/*  ✅ Formatear números y fechas                                             */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • PDFKit - Generación de PDFs                                             */
/*  • fs - Manejo de archivos                                                 */
/*  • path - Manejo de rutas                                                  */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: saleController                                           */
/*  • Usa: PDFKit para generar el PDF                                         */
/*  • Relacionado con: Sale model                                             */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Las dimensiones están optimizadas para papel térmico de 80mm           */
/*  • El ancho máximo es de 72mm (aprox 48 caracteres por línea)             */
/*  • Los PDFs se guardan temporalmente y se eliminan después de enviar      */
/*  • Soporta caracteres especiales y emojis básicos                          */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Generación de PDF básico                                           */
/*      ✅ Formato para impresión térmica                                      */
/*      ✅ Soporte de métodos de pago                                         */
/*      ✅ Generación de HTML                                                 */
/*                                                                            */
/* ========================================================================== */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/* ========================================================================== */
/*  CONFIGURACIÓN                                                             */
/* ========================================================================== */

const CONFIG = {
    // Dimensiones para papel térmico 80mm (72mm de ancho util)
    PAGE_WIDTH: 226, // 80mm ≈ 226 puntos (1 punto = 1/72 pulgada)
    PAGE_HEIGHT: 600,
    MARGIN: 10,
    LINE_HEIGHT: 16,
    FONT_SIZE: 9,
    HEADER_FONT_SIZE: 12,
    TITLE_FONT_SIZE: 14,
    // Línea separadora
    SEPARATOR: '================================',
    LINE: '--------------------------------'
};

/* ========================================================================== */
/*  FORMATEAR NÚMEROS                                                         */
/* ========================================================================== */

const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
};

const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
};

/* ========================================================================== */
/*  GENERAR FACTURA PDF                                                       */
/* ========================================================================== */

/**
 * Genera un PDF de factura para impresión térmica 80mm
 * @param {Object} sale - Objeto de venta con detalles y items
 * @returns {Promise<string>} - Ruta del archivo PDF generado
 */
const generateInvoice = async (sale) => {
    return new Promise((resolve, reject) => {
        try {
            // Crear directorio temporal si no existe
            const tempDir = path.join(__dirname, '../../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            
            const filename = `invoice_${sale.factura_numero}_${Date.now()}.pdf`;
            const filepath = path.join(tempDir, filename);
            
            // Crear documento PDF
            const doc = new PDFDocument({
                size: [CONFIG.PAGE_WIDTH, CONFIG.PAGE_HEIGHT],
                margin: CONFIG.MARGIN,
                autoFirstPage: true
            });
            
            // Escribir a archivo
            const stream = fs.createWriteStream(filepath);
            doc.pipe(stream);
            
            // Configurar fuentes
            doc.fontSize(CONFIG.HEADER_FONT_SIZE);
            doc.font('Helvetica-Bold');
            
            /* ================================================================ */
            /*  ENCABEZADO                                                      */
            /* ================================================================ */
            
            // Título del negocio
            doc.text('COREX', { align: 'center' });
            doc.fontSize(CONFIG.FONT_SIZE);
            doc.font('Helvetica');
            doc.text('Servicios Tecnológicos', { align: 'center' });
            doc.moveDown(0.5);
            
            // Información de contacto
            doc.fontSize(CONFIG.FONT_SIZE - 1);
            doc.text('Cel: 311 561 0825', { align: 'center' });
            doc.text('Email: corexservice@gmail.com', { align: 'center' });
            doc.moveDown(0.5);
            
            /* ================================================================ */
            /*  SEPARADOR                                                       */
            /* ================================================================ */
            
            doc.fontSize(CONFIG.FONT_SIZE);
            doc.text(CONFIG.SEPARATOR, { align: 'center' });
            doc.moveDown(0.3);
            
            /* ================================================================ */
            /*  DATOS DE FACTURA                                                */
            /* ================================================================ */
            
            doc.font('Helvetica-Bold');
            doc.text(`FACTURA N°: ${sale.factura_numero}`, { align: 'center' });
            doc.font('Helvetica');
            doc.text(`FECHA: ${formatDate(sale.fecha_venta)}`, { align: 'center' });
            doc.text(`VENDEDOR: ${sale.vendedor_nombre || 'N/A'}`, { align: 'center' });
            
            if (sale.cliente_nombre) {
                doc.text(`CLIENTE: ${sale.cliente_nombre}`, { align: 'center' });
            }
            
            doc.moveDown(0.5);
            doc.text(CONFIG.SEPARATOR, { align: 'center' });
            doc.moveDown(0.3);
            
            /* ================================================================ */
            /*  PRODUCTOS                                                       */
            /* ================================================================ */
            
            // Encabezado de productos
            doc.font('Helvetica-Bold');
            doc.text('PROD', CONFIG.MARGIN, doc.y, { continued: true });
            doc.text('CANT', CONFIG.PAGE_WIDTH - 80, doc.y, { continued: true });
            doc.text('P/U', CONFIG.PAGE_WIDTH - 50, doc.y, { continued: true });
            doc.text('TOTAL', CONFIG.PAGE_WIDTH - 25, doc.y);
            doc.font('Helvetica');
            doc.text(CONFIG.LINE, { align: 'center' });
            
            // Lista de productos
            if (sale.items && sale.items.length > 0) {
                for (const item of sale.items) {
                    // Nombre del producto (truncado si es muy largo)
                    let productName = item.producto_nombre || `Producto #${item.producto_id}`;
                    if (productName.length > 25) {
                        productName = productName.substring(0, 22) + '...';
                    }
                    
                    // Mostrar nombre del producto
                    doc.text(productName, CONFIG.MARGIN, doc.y);
                    
                    // Cantidad, precio unitario y subtotal en la misma línea
                    const yPosition = doc.y - CONFIG.LINE_HEIGHT;
                    doc.text(`${item.cantidad}`, CONFIG.PAGE_WIDTH - 80, yPosition);
                    doc.text(formatPrice(item.precio_unitario), CONFIG.PAGE_WIDTH - 50, yPosition);
                    doc.text(formatPrice(item.subtotal), CONFIG.PAGE_WIDTH - 25, yPosition);
                    
                    doc.moveDown(0.3);
                }
            } else {
                doc.text('No hay productos registrados', { align: 'center' });
            }
            
            doc.moveDown(0.5);
            doc.text(CONFIG.SEPARATOR, { align: 'center' });
            doc.moveDown(0.3);
            
            /* ================================================================ */
            /*  TOTALES                                                         */
            /* ================================================================ */
            
            doc.font('Helvetica-Bold');
            doc.text(`SUBTOTAL: ${formatPrice(sale.total)}`, CONFIG.MARGIN, doc.y);
            doc.text(`TOTAL: ${formatPrice(sale.total)}`, CONFIG.MARGIN, doc.y + CONFIG.LINE_HEIGHT);
            doc.font('Helvetica');
            
            doc.moveDown(0.5);
            doc.text(CONFIG.SEPARATOR, { align: 'center' });
            doc.moveDown(0.3);
            
            /* ================================================================ */
            /*  MÉTODO DE PAGO                                                  */
            /* ================================================================ */
            
            doc.font('Helvetica-Bold');
            doc.text(`MÉTODO DE PAGO: ${sale.metodo_pago.toUpperCase()}`, { align: 'center' });
            doc.font('Helvetica');
            
            if (sale.metodo_pago === 'transferencia') {
                doc.text('Comprobante adjunto: SI', { align: 'center' });
                doc.fontSize(CONFIG.FONT_SIZE - 1);
                doc.text('(Verificar en sistema)', { align: 'center' });
                doc.fontSize(CONFIG.FONT_SIZE);
            }
            
            doc.moveDown(0.5);
            doc.text(CONFIG.SEPARATOR, { align: 'center' });
            doc.moveDown(0.5);
            
            /* ================================================================ */
            /*  PIE DE PÁGINA                                                   */
            /* ================================================================ */
            
            doc.font('Helvetica-Bold');
            doc.fontSize(CONFIG.TITLE_FONT_SIZE);
            doc.text('¡GRACIAS POR SU COMPRA!', { align: 'center' });
            doc.fontSize(CONFIG.FONT_SIZE - 1);
            doc.font('Helvetica');
            doc.text('Visítenos nuevamente', { align: 'center' });
            doc.moveDown(0.5);
            doc.text(formatDate(new Date()), { align: 'center', fontSize: CONFIG.FONT_SIZE - 2 });
            
            // Finalizar documento
            doc.end();
            
            stream.on('finish', () => {
                resolve(filepath);
            });
            
            stream.on('error', (error) => {
                reject(error);
            });
            
        } catch (error) {
            console.error('Error al generar factura PDF:', error);
            reject(error);
        }
    });
};

/* ========================================================================== */
/*  GENERAR HTML PARA VISTA PREVIA                                            */
/* ========================================================================== */

/**
 * Genera una versión HTML de la factura para vista previa en navegador
 * @param {Object} sale - Objeto de venta con detalles y items
 * @returns {string} - HTML de la factura
 */
const generateInvoiceHTML = (sale) => {
    const itemsHtml = (sale.items || []).map(item => `
        <tr>
            <td style="padding: 4px;">${item.producto_nombre || `Producto #${item.producto_id}`}</td>
            <td style="padding: 4px; text-align: center;">${item.cantidad}</td>
            <td style="padding: 4px; text-align: right;">${formatPrice(item.precio_unitario)}</td>
            <td style="padding: 4px; text-align: right;">${formatPrice(item.subtotal)}</td>
        </tr>
    `).join('');
    
    return `<!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Factura CoreX #${sale.factura_numero}</title>
        <style>
            body {
                font-family: 'Courier New', monospace;
                width: 80mm;
                margin: 0 auto;
                padding: 10px;
                background: white;
            }
            .header {
                text-align: center;
                margin-bottom: 10px;
            }
            .title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            .subtitle {
                font-size: 12px;
                margin-bottom: 5px;
            }
            .separator {
                text-align: center;
                border-top: 1px dashed #000;
                margin: 10px 0;
            }
            .invoice-data {
                margin-bottom: 10px;
            }
            .invoice-data p {
                margin: 3px 0;
                font-size: 11px;
            }
            table {
                width: 100%;
                font-size: 10px;
                margin: 10px 0;
            }
            .totals {
                text-align: right;
                margin-top: 10px;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
                font-size: 11px;
            }
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="title">COREX</div>
            <div class="subtitle">Servicios Tecnológicos</div>
            <div class="subtitle">Cel: 311 561 0825</div>
        </div>
        
        <div class="separator"></div>
        
        <div class="invoice-data">
            <p><strong>FACTURA N°: ${sale.factura_numero}</strong></p>
            <p>FECHA: ${formatDate(sale.fecha_venta)}</p>
            <p>VENDEDOR: ${sale.vendedor_nombre || 'N/A'}</p>
            ${sale.cliente_nombre ? `<p>CLIENTE: ${sale.cliente_nombre}</p>` : ''}
        </div>
        
        <div class="separator"></div>
        
        <table>
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Cant</th>
                    <th>Precio</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>
        
        <div class="separator"></div>
        
        <div class="totals">
            <p><strong>TOTAL: ${formatPrice(sale.total)}</strong></p>
        </div>
        
        <div class="separator"></div>
        
        <div class="footer">
            <p><strong>MÉTODO DE PAGO: ${sale.metodo_pago.toUpperCase()}</strong></p>
            ${sale.metodo_pago === 'transferencia' ? '<p>Comprobante adjunto</p>' : ''}
            <p>¡GRACIAS POR SU COMPRA!</p>
            <p>${formatDate(new Date())}</p>
        </div>
    </body>
    </html>`;
};

/* ========================================================================== */
/*  EXPORTAR FUNCIONES                                                        */
/* ========================================================================== */

module.exports = {
    generateInvoice,
    generateInvoiceHTML,
    formatPrice,
    formatDate
};