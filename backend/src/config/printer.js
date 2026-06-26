// Archivo: printer.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: printer.js                                                    */
/*  📁 UBICACIÓN: backend/src/config/printer.js                               */
/*  🚀 MÓDULO: Configuración                                                  */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Configuración centralizada para impresión térmica de tickets. Define     */
/*  los parámetros para impresoras térmicas de 80mm, incluyendo tamaño de    */
/*  página, márgenes, fuentes y caracteres especiales.                       */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Configuración de tamaño para papel térmico 80mm                        */
/*  ✅ Configuración de fuentes y caracteres                                  */
/*  ✅ Caracteres especiales para corte y apertura de cajón                   */
/*  ✅ Configuración de códigos ESC/POS                                        */
/*  ✅ Opciones de alineación y formato                                       */
/*  ✅ Configuración de emojis y caracteres especiales                        */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • Ninguna (solo exporta configuración)                                    */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: invoiceGenerator.js                                      */
/*  • Usado por: node-thermal-printer                                        */
/*  • Relacionado con: saleController                                         */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Compatible con impresoras térmicas ESC/POS                              */
/*  • Ancho máximo: 48 caracteres por línea (fuente normal)                  */
/*  • Soporte para corte automático de papel                                  */
/*  • Comandos de apertura de cajón (opcional)                                */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Configuración de papel 80mm                                        */
/*      ✅ Códigos ESC/POS                                                    */
/*      ✅ Caracteres especiales                                              */
/*      ✅ Opciones de formato                                                */
/*                                                                            */
/* ========================================================================== */

/* ========================================================================== */
/*  CONFIGURACIÓN DE PAPEL                                                    */
/* ========================================================================== */

const PAPER_CONFIG = {
    // Tamaño para papel térmico 80mm
    width: 80, // mm
    widthPixels: 576, // puntos (72 puntos por pulgada * 80mm / 25.4)
    
    // Caracteres por línea (fuente normal)
    maxCharsPerLine: 48,
    
    // Caracteres por línea (fuente condensada)
    maxCharsPerLineCondensed: 64,
    
    // Caracteres por línea (fuente ampliada)
    maxCharsPerLineExpanded: 24,
    
    // Márgenes en mm
    marginLeft: 2,
    marginRight: 2,
    
    // Altura de línea en puntos
    lineHeight: 24
};

/* ========================================================================== */
/*  CONFIGURACIÓN DE FUENTES                                                  */
/* ========================================================================== */

const FONT_CONFIG = {
    // Tamaños de fuente
    sizes: {
        normal: 0,   // Fuente normal
        condensed: 1, // Fuente condensada (2/3 de ancho)
        expanded: 2   // Fuente ampliada (2x ancho)
    },
    
    // Estilos de texto
    styles: {
        normal: 0,
        bold: 1,
        italic: 2,
        boldItalic: 3
    },
    
    // Alineación
    align: {
        left: 0,
        center: 1,
        right: 2
    },
    
    // Tamaño de fuente en puntos
    fontSize: 12,
    headerFontSize: 16,
    titleFontSize: 14
};

/* ========================================================================== */
/*  COMANDOS ESC/POS                                                          */
/* ========================================================================== */

const ESC_POS_COMMANDS = {
    // Iniciar impresión
    init: '\x1B\x40',
    
    // Alimentación de papel
    feed: {
        line: '\x0A',           // Alimentar una línea
        lines: (n) => `\x1B\x64${String.fromCharCode(n)}`, // Alimentar n líneas
        fullCut: '\x1D\x56\x41\x00', // Corte total
        partialCut: '\x1D\x56\x42\x00' // Corte parcial
    },
    
    // Estilos de texto
    bold: {
        on: '\x1B\x45\x01',
        off: '\x1B\x45\x00'
    },
    
    underline: {
        on: '\x1B\x2D\x01',
        off: '\x1B\x2D\x00'
    },
    
    italic: {
        on: '\x1B\x34\x01',
        off: '\x1B\x34\x00'
    },
    
    // Tamaño de texto
    fontSize: {
        normal: '\x1D\x21\x00',
        doubleWidth: '\x1D\x21\x10',
        doubleHeight: '\x1D\x21\x20',
        doubleWidthHeight: '\x1D\x21\x30'
    },
    
    // Alineación
    align: {
        left: '\x1B\x61\x00',
        center: '\x1B\x61\x01',
        right: '\x1B\x61\x02'
    },
    
    // Apertura de cajón
    cashDrawer: {
        pulse1: '\x1B\x70\x00\x19\xFF', // Pin 2
        pulse2: '\x1B\x70\x01\x19\xFF'  // Pin 5
    },
    
    // Caracteres especiales
    barcode: {
        init: '\x1D\x6B',
        print: (data) => `\x1D\x6B\x02${data}\x00`
    },
    
    qrcode: {
        init: '\x1D\x28\x6B',
        print: (data) => {
            const len = data.length + 3;
            return `\x1D\x28\x6B\x03\x00\x31\x50${data}`;
        }
    }
};

/* ========================================================================== */
/*  CARACTERES ESPECIALES                                                     */
/* ========================================================================== */

const SPECIAL_CHARS = {
    // Símbolos de moneda
    currency: {
        colombianPeso: '$',
        usDollar: 'US$',
        euro: '€'
    },
    
    // Símbolos comerciales
    commercial: {
        registered: '®',
        copyright: '©',
        trademark: '™'
    },
    
    // Caracteres de línea
    lines: {
        horizontal: '─',
        vertical: '│',
        topLeft: '┌',
        topRight: '┐',
        bottomLeft: '└',
        bottomRight: '┘',
        cross: '┼'
    },
    
    // Emojis básicos
    emojis: {
        check: '✓',
        cross: '✗',
        star: '★',
        heart: '♥',
        smile: '☺',
        phone: '☎'
    },
    
    // Caracteres de separación
    separators: {
        dash: '-',
        equal: '=',
        star: '*',
        space: ' '
    }
};

/* ========================================================================== */
/*  FORMATOS DE TICKET                                                        */
/* ========================================================================== */

const TICKET_FORMATS = {
    // Formato de fecha/hora
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm:ss',
    
    // Formato de números
    numberFormat: {
        decimal: ',',
        thousand: '.',
        precision: 0
    },
    
    // Longitud máxima de textos
    maxLengths: {
        productName: 30,
        customerName: 40,
        sellerName: 30
    },
    
    // Separadores predefinidos
    separators: {
        full: '================================',
        half: '--------------------------------',
        dotted: '................................',
        star: '********************************'
    }
};

/* ========================================================================== */
/*  CONFIGURACIÓN DE INTERFAZ                                                 */
/* ========================================================================== */

const INTERFACE_CONFIG = {
    // Tipo de interfaz (usb, serial, network, file)
    type: process.env.PRINTER_TYPE || 'network',
    
    // Configuración para USB
    usb: {
        vendorId: process.env.PRINTER_VENDOR_ID || 0x0,
        productId: process.env.PRINTER_PRODUCT_ID || 0x0
    },
    
    // Configuración para red
    network: {
        host: process.env.PRINTER_HOST || 'localhost',
        port: parseInt(process.env.PRINTER_PORT) || 9100
    },
    
    // Configuración para serial
    serial: {
        port: process.env.PRINTER_SERIAL_PORT || '/dev/ttyUSB0',
        baudRate: parseInt(process.env.PRINTER_BAUD_RATE) || 9600
    },
    
    // Configuración para archivo (debug)
    file: {
        path: process.env.PRINTER_FILE_PATH || './temp/print.log'
    }
};

/* ========================================================================== */
/*  FUNCIONES DE CONFIGURACIÓN                                                */
/* ========================================================================== */

/**
 * Obtiene la configuración completa para la impresora
 * @returns {Object} - Configuración completa
 */
const getPrinterConfig = () => {
    return {
        paper: PAPER_CONFIG,
        font: FONT_CONFIG,
        commands: ESC_POS_COMMANDS,
        specialChars: SPECIAL_CHARS,
        ticketFormats: TICKET_FORMATS,
        interface: INTERFACE_CONFIG
    };
};

/**
 * Obtiene el comando ESC/POS para un tipo específico
 * @param {string} category - Categoría del comando
 * @param {string} command - Nombre del comando
 * @returns {string} - Código ESC/POS
 */
const getCommand = (category, command) => {
    try {
        const cmd = ESC_POS_COMMANDS[category][command];
        if (typeof cmd === 'function') {
            return cmd;
        }
        return cmd || '';
    } catch (error) {
        return '';
    }
};

/**
 * Obtiene la configuración de interfaz activa
 * @returns {Object} - Configuración de interfaz
 */
const getActiveInterface = () => {
    const type = INTERFACE_CONFIG.type;
    return {
        type,
        config: INTERFACE_CONFIG[type] || {}
    };
};

/* ========================================================================== */
/*  EXPORTAR CONFIGURACIÓN                                                    */
/* ========================================================================== */

module.exports = {
    // Configuraciones principales
    PAPER_CONFIG,
    FONT_CONFIG,
    ESC_POS_COMMANDS,
    SPECIAL_CHARS,
    TICKET_FORMATS,
    INTERFACE_CONFIG,
    
    // Funciones
    getPrinterConfig,
    getCommand,
    getActiveInterface,
    
    // Constantes útiles
    DEFAULT_CHARS_PER_LINE: PAPER_CONFIG.maxCharsPerLine,
    LINE_HEIGHT: PAPER_CONFIG.lineHeight
};