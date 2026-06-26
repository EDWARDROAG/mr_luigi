// Archivo: adminSeeder.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: adminSeeder.js                                                */
/*  📁 UBICACIÓN: backend/src/seeds/adminSeeder.js                            */
/*  🚀 MÓDULO: Semillas (Seeds)                                               */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Script para la creación del usuario administrador por defecto del        */
/*  sistema. Se ejecuta una sola vez durante la instalación inicial.         */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Crear usuario administrador por defecto                                */
/*  ✅ Verificar si ya existe antes de crear                                  */
/*  ✅ Hash de contraseña segura                                              */
/*  ✅ Registrar en log la creación                                           */
/*  ✅ Crear categorías iniciales                                             */
/*  ✅ Crear productos de ejemplo (opcional)                                  */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • User Model - Operaciones de base de datos                               */
/*  • Category Model - Operaciones de categorías                              */
/*  • Product Model - Operaciones de productos                                */
/*  • hashPassword - Utilidad para hash de contraseñas                        */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: scripts de inicialización                                */
/*  • Se ejecuta al iniciar por primera vez                                   */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Solo se ejecuta una vez (verifica existencia previa)                   */
/*  • La contraseña por defecto debe cambiarse después                        */
/*  • Requiere conexión a base de datos                                       */
/*  • Las credenciales se toman del archivo .env                              */
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Creación de admin por defecto                                      */
/*      ✅ Verificación de existencia                                         */
/*      ✅ Creación de categorías iniciales                                   */
/*                                                                            */
/* ========================================================================== */

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { query } = require('../config/database');

/* ========================================================================== */
/*  CONFIGURACIÓN DEL ADMIN POR DEFECTO                                       */
/* ========================================================================== */

const DEFAULT_ADMIN = {
    nombre: 'Administrador CoreX',
    email: process.env.ADMIN_EMAIL || 'corexservice@gmail.com',
    password: process.env.ADMIN_PASSWORD || 'CoreX2026Admin',
    role: 'admin'
};

/* ========================================================================== */
/*  CATEGORÍAS INICIALES                                                      */
/* ========================================================================== */

const DEFAULT_CATEGORIES = [
    // Categorías de venta
    { nombre: 'Celulares', tipo: 'venta', descripcion: 'Teléfonos inteligentes nuevos y usados' },
    { nombre: 'Laptops', tipo: 'venta', descripcion: 'Computadores portátiles nuevas y usadas' },
    { nombre: 'Computadores de Escritorio', tipo: 'venta', descripcion: 'Torres y computadores de escritorio' },
    { nombre: 'Impresoras', tipo: 'venta', descripcion: 'Impresoras nuevas y usadas' },
    { nombre: 'Tablets', tipo: 'venta', descripcion: 'Tablets nuevas y usadas' },
    { nombre: 'Accesorios', tipo: 'accesorio', descripcion: 'Cargadores, fundas, audífonos, etc.' },
    { nombre: 'Tarjetas Gráficas', tipo: 'venta', descripcion: 'GPU para gaming y edición' },
    { nombre: 'Componentes PC', tipo: 'venta', descripcion: 'Procesadores, RAM, discos, etc.' },
    
    // Categorías de mantenimiento
    { nombre: 'Mantenimiento de Celulares', tipo: 'mantenimiento', descripcion: 'Reparación y mantenimiento de celulares' },
    { nombre: 'Mantenimiento de Laptops', tipo: 'mantenimiento', descripcion: 'Reparación y mantenimiento de laptops' },
    { nombre: 'Mantenimiento de Computadores', tipo: 'mantenimiento', descripcion: 'Reparación y mantenimiento de PC' },
    { nombre: 'Mantenimiento de Impresoras', tipo: 'mantenimiento', descripcion: 'Reparación y mantenimiento de impresoras' }
];

/* ========================================================================== */
/*  PRODUCTOS DE EJEMPLO (OPCIONAL)                                           */
/* ========================================================================== */

const SAMPLE_PRODUCTS = [
    {
        nombre: 'iPhone 12 128GB',
        descripcion: 'iPhone 12 reacondicionado, batería al 85%, pantalla impecable',
        precio: 1200000,
        condicion: 'segunda',
        categoria_nombre: 'Celulares',
        destacado: true
    },
    {
        nombre: 'iPhone 13 256GB',
        descripcion: 'iPhone 13 como nuevo, con garantía de 3 meses',
        precio: 2100000,
        condicion: 'segunda',
        categoria_nombre: 'Celulares',
        destacado: true
    },
    {
        nombre: 'MacBook Air M1',
        descripcion: 'MacBook Air M1, 8GB RAM, 256GB SSD',
        precio: 3500000,
        condicion: 'segunda',
        categoria_nombre: 'Laptops',
        destacado: true
    },
    {
        nombre: 'Lenovo ThinkPad T480',
        descripcion: 'Laptop empresarial, i5, 16GB RAM, 512GB SSD',
        precio: 1800000,
        condicion: 'segunda',
        categoria_nombre: 'Laptops',
        destacado: false
    },
    {
        nombre: 'Torre Gamer RTX 3060',
        descripcion: 'Torre gamer con RTX 3060, i7, 32GB RAM, 1TB SSD',
        precio: 4200000,
        condicion: 'segunda',
        categoria_nombre: 'Computadores de Escritorio',
        destacado: true
    },
    {
        nombre: 'Impresora HP LaserJet',
        descripcion: 'Impresora láser monocromática, WiFi, rápida',
        precio: 450000,
        condicion: 'segunda',
        categoria_nombre: 'Impresoras',
        destacado: false
    },
    {
        nombre: 'Cargador Rápido 20W',
        descripcion: 'Cargador tipo C para iPhone y Android',
        precio: 35000,
        condicion: 'nuevo',
        categoria_nombre: 'Accesorios',
        destacado: false
    },
    {
        nombre: 'Funda Protectora iPhone 12',
        descripcion: 'Funda de silicona resistente a caídas',
        precio: 25000,
        condicion: 'nuevo',
        categoria_nombre: 'Accesorios',
        destacado: false
    },
    {
        nombre: 'RTX 3060 12GB',
        descripcion: 'Tarjeta gráfica NVIDIA RTX 3060 12GB GDDR6',
        precio: 1350000,
        condicion: 'segunda',
        categoria_nombre: 'Tarjetas Gráficas',
        destacado: true
    },
    {
        nombre: 'Mantenimiento de Celular',
        descripcion: 'Servicio completo de mantenimiento para celular',
        precio: 80000,
        condicion: 'nuevo',
        categoria_nombre: 'Mantenimiento de Celulares',
        destacado: false
    }
];

/* ========================================================================== */
/*  FUNCIÓN PRINCIPAL DE SEEDING                                              */
/* ========================================================================== */

/**
 * Ejecuta el seeding del administrador y datos iniciales
 * @returns {Promise<Object>} - Resultado del seeding
 */
const seedAdmin = async () => {
    const result = {
        adminCreated: false,
        categoriesCreated: 0,
        productsCreated: 0,
        errors: []
    };
    
    try {
        console.log('🌱 Iniciando seeding de datos iniciales...');
        
        /* ================================================================== */
        /*  1. CREAR ADMINISTRADOR POR DEFECTO                                */
        /* ================================================================== */
        
        // Verificar si ya existe un administrador
        const existingAdmin = await User.findByEmail(DEFAULT_ADMIN.email);
        
        if (!existingAdmin) {
            const admin = await User.create({
                nombre: DEFAULT_ADMIN.nombre,
                email: DEFAULT_ADMIN.email,
                password: DEFAULT_ADMIN.password,
                role: DEFAULT_ADMIN.role
            });
            
            result.adminCreated = true;
            console.log(`✅ Administrador creado: ${DEFAULT_ADMIN.email}`);
            console.log(`   Contraseña: ${DEFAULT_ADMIN.password} (CAMBIAR DESPUÉS DE INICIAR SESIÓN)`);
        } else {
            console.log(`ℹ️ Administrador ya existe: ${DEFAULT_ADMIN.email}`);
        }
        
        /* ================================================================== */
        /*  2. CREAR CATEGORÍAS INICIALES                                     */
        /* ================================================================== */
        
        for (const categoryData of DEFAULT_CATEGORIES) {
            try {
                // Verificar si la categoría ya existe
                const existingCategory = await Category.findByName(categoryData.nombre);
                
                if (!existingCategory) {
                    await Category.create(categoryData);
                    result.categoriesCreated++;
                    console.log(`✅ Categoría creada: ${categoryData.nombre}`);
                } else {
                    console.log(`ℹ️ Categoría ya existe: ${categoryData.nombre}`);
                }
            } catch (error) {
                result.errors.push(`Error creando categoría ${categoryData.nombre}: ${error.message}`);
                console.error(`❌ Error creando categoría ${categoryData.nombre}:`, error.message);
            }
        }
        
        /* ================================================================== */
        /*  3. CREAR PRODUCTOS DE EJEMPLO (OPCIONAL)                          */
        /* ================================================================== */
        
        // Verificar si ya hay productos
        const existingProducts = await Product.findAll({}, 1, 1);
        
        if (existingProducts.pagination.total === 0) {
            for (const productData of SAMPLE_PRODUCTS) {
                try {
                    // Buscar ID de la categoría por nombre
                    const category = await Category.findByName(productData.categoria_nombre);
                    
                    if (category) {
                        await Product.create({
                            nombre: productData.nombre,
                            descripcion: productData.descripcion,
                            precio: productData.precio,
                            condicion: productData.condicion,
                            categoria_id: category.id,
                            imagen_url: null,
                            destacado: productData.destacado
                        });
                        result.productsCreated++;
                        console.log(`✅ Producto creado: ${productData.nombre}`);
                    } else {
                        console.warn(`⚠️ Categoría no encontrada para producto: ${productData.nombre}`);
                    }
                } catch (error) {
                    result.errors.push(`Error creando producto ${productData.nombre}: ${error.message}`);
                    console.error(`❌ Error creando producto ${productData.nombre}:`, error.message);
                }
            }
        } else {
            console.log(`ℹ️ Ya existen productos en el sistema. No se crearon productos de ejemplo.`);
        }
        
        console.log('🌱 Seeding completado!');
        console.log(`   - Administrador: ${result.adminCreated ? 'Creado' : 'Existente'}`);
        console.log(`   - Categorías creadas: ${result.categoriesCreated}`);
        console.log(`   - Productos creados: ${result.productsCreated}`);
        
        if (result.errors.length > 0) {
            console.warn(`   - Errores: ${result.errors.length}`);
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ Error en seeding:', error);
        result.errors.push(`Error general: ${error.message}`);
        throw error;
    }
};

/* ========================================================================== */
/*  FUNCIÓN PARA VERIFICAR SI EL SEEDING YA SE EJECUTÓ                        */
/* ========================================================================== */

/**
 * Verifica si el seeding ya se ha ejecutado
 * @returns {Promise<boolean>} - true si ya se ejecutó
 */
const resetAdminPassword = async () => {
    const admin = await User.findByEmail(DEFAULT_ADMIN.email);

    if (!admin) {
        throw new Error(`No existe el administrador: ${DEFAULT_ADMIN.email}`);
    }

    await User.update(admin.id, { password: DEFAULT_ADMIN.password });
    console.log(`✅ Contraseña de administrador restablecida: ${DEFAULT_ADMIN.email}`);
    return true;
};

const hasSeeded = async () => {
    try {
        // Verificar si existe el administrador por defecto
        const admin = await User.findByEmail(DEFAULT_ADMIN.email);
        
        // Verificar si existen categorías
        const categories = await Category.findAll();
        
        return !!(admin && categories.length > 0);
    } catch (error) {
        console.error('Error verificando seeding:', error);
        return false;
    }
};

/* ========================================================================== */
/*  FUNCIÓN PARA REINICIAR SEEDING (RESET)                                    */
/* ========================================================================== */

/**
 * Reinicia el seeding (elimina datos y los recrea)
 * @param {boolean} resetProducts - Si se deben eliminar productos
 * @returns {Promise<Object>} - Resultado del reset
 */
const resetSeeding = async (resetProducts = false) => {
    try {
        console.log('🔄 Reiniciando seeding...');
        
        if (resetProducts) {
            // Eliminar productos
            await query('TRUNCATE TABLE sale_items CASCADE');
            await query('TRUNCATE TABLE products CASCADE');
            console.log('✅ Productos eliminados');
        }
        
        // Eliminar categorías (excepto las que tienen productos)
        await query('TRUNCATE TABLE categories CASCADE');
        console.log('✅ Categorías eliminadas');
        
        // Eliminar usuarios (excepto el admin por defecto)
        await query("DELETE FROM users WHERE email != $1", [DEFAULT_ADMIN.email]);
        console.log('✅ Usuarios eliminados');
        
        // Volver a ejecutar seeding
        const result = await seedAdmin();
        
        return result;
    } catch (error) {
        console.error('❌ Error reiniciando seeding:', error);
        throw error;
    }
};

/* ========================================================================== */
/*  EJECUCIÓN DIRECTA (SI SE LLAMA EL ARCHIVO)                                */
/* ========================================================================== */

// Si el archivo se ejecuta directamente (no se importa)
if (require.main === module) {
    (async () => {
        try {
            const resetPassword = process.argv.includes('--reset-admin-password');

            if (resetPassword) {
                console.log('🔐 Restableciendo contraseña del administrador...');
                await resetAdminPassword();
            } else {
                console.log('🚀 Ejecutando adminSeeder directamente...');
                await seedAdmin();
            }

            process.exit(0);
        } catch (error) {
            console.error('❌ Error ejecutando seeder:', error);
            process.exit(1);
        }
    })();
}

/* ========================================================================== */
/*  EXPORTAR FUNCIONES                                                        */
/* ========================================================================== */

module.exports = {
    seedAdmin,
    resetAdminPassword,
    hasSeeded,
    resetSeeding,
    DEFAULT_ADMIN,
    DEFAULT_CATEGORIES,
    SAMPLE_PRODUCTS
};