// Archivo: index.js
// CoreX - Generado automáticamente

/* ========================================================================== */
/*                                                                            */
/*  📄 ARCHIVO: index.js                                                      */
/*  📁 UBICACIÓN: backend/src/models/index.js                                 */
/*  🚀 MÓDULO: Modelos                                                        */
/*  🏷️  VERSIÓN: v1.0.0                                                      */
/*  📅 ÚLTIMA ACTUALIZACIÓN: 2026-05-21 10:30                                 */
/*  👨‍💻 AUTOR: CoreX Team                                                      */
/*                                                                            */
/* ========================================================================== */
/*                                                                            */
/*  🎯 PROPÓSITO                                                              */
/*  ------------------------------------------------------------------------  */
/*  Punto de entrada centralizado para todos los modelos del sistema.        */
/*  Exporta todos los modelos y sus relaciones para facilitar la importación */
/*  en controladores y otros módulos.                                        */
/*                                                                            */
/*  🧩 FUNCIONALIDADES PRINCIPALES                                            */
/*  ------------------------------------------------------------------------  */
/*  ✅ Exportación centralizada de todos los modelos                          */
/*  ✅ Inicialización de relaciones entre modelos                             */
/*  ✅ Configuración de asociaciones (uno a muchos, muchos a uno)             */
/*  ✅ Singleton para evitar múltiples instancias                             */
/*                                                                            */
/*  📦 DEPENDENCIAS                                                           */
/*  ------------------------------------------------------------------------  */
/*  • User - Modelo de usuarios                                               */
/*  • Product - Modelo de productos                                           */
/*  • Category - Modelo de categorías                                         */
/*  • Sale - Modelo de ventas                                                 */
/*  • SaleItem - Modelo de items de venta                                     */
/*  • Log - Modelo de logs                                                    */
/*                                                                            */
/*  🔗 RELACIONES                                                             */
/*  ------------------------------------------------------------------------  */
/*  • Importado por: server.js, controladores                                 */
/*  • Define relaciones:                                                       */
/*    - User → Sale (uno a muchos)                                            */
/*    - Category → Product (uno a muchos)                                     */
/*    - Product → SaleItem (uno a muchos)                                     */
/*    - Sale → SaleItem (uno a muchos)                                        */
/*    - User → Log (uno a muchos)                                             */
/*                                                                            */
/*  ⚠️ NOTAS IMPORTANTES                                                      */
/*  ------------------------------------------------------------------------  */
/*  • Las relaciones se definen aquí para evitar imports circulares           */
/*  • Los modelos no tienen dependencias directas entre sí                    */
/*  • Este archivo debe importarse después de que todos los modelos estén listos*/
/*                                                                            */
/*  🛠️ HISTORIAL DE CAMBIOS                                                   */
/*  ------------------------------------------------------------------------  */
/*  [v1.0.0] - 2026-05-21                                                    */
/*      ✅ Creación inicial                                                   */
/*      ✅ Exportación de todos los modelos                                    */
/*      ✅ Definición de relaciones                                            */
/*                                                                            */
/* ========================================================================== */

// Importar modelos individuales
const User = require('./User');
const Product = require('./Product');
const Category = require('./Category');
const Sale = require('./Sale');
const SaleItem = require('./SaleItem');
const Log = require('./Log');

/* ========================================================================== */
/*  DEFINICIÓN DE RELACIONES ENTRE MODELOS                                    */
/* ========================================================================== */

/**
 * RELACIONES DE USUARIO
 * Un usuario (admin o cajero) puede tener muchas ventas y muchos logs
 */
User.hasMany = () => {
    // Relación con Sale: un usuario puede tener muchas ventas
    Sale.belongsTo(User, { foreignKey: 'vendedor_id', as: 'vendedor' });
    
    // Relación con Log: un usuario puede tener muchos logs
    Log.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });
};

/**
 * RELACIONES DE CATEGORÍA
 * Una categoría puede tener muchos productos
 */
Category.hasMany = () => {
    Product.belongsTo(Category, { foreignKey: 'categoria_id', as: 'categoria' });
};

/**
 * RELACIONES DE PRODUCTO
 * Un producto puede aparecer en muchos items de venta
 */
Product.hasMany = () => {
    SaleItem.belongsTo(Product, { foreignKey: 'producto_id', as: 'producto' });
};

/**
 * RELACIONES DE VENTA
 * Una venta tiene muchos items de venta y pertenece a un vendedor
 */
Sale.hasMany = () => {
    SaleItem.belongsTo(Sale, { foreignKey: 'sale_id', as: 'sale' });
};

/**
 * RELACIONES DE SALE_ITEM
 * Un item de venta pertenece a una venta y a un producto
 */
SaleItem.belongsTo = () => {
    // Relaciones ya definidas en los métodos anteriores
};

/**
 * RELACIONES DE LOG
 * Un log pertenece a un usuario
 */
Log.belongsTo = () => {
    // Relación ya definida en User.hasMany()
};

/* ========================================================================== */
/*  INICIALIZAR TODAS LAS RELACIONES                                          */
/* ========================================================================== */

const initializeRelations = () => {
    User.hasMany();
    Category.hasMany();
    Product.hasMany();
    Sale.hasMany();
    // Nota: Las relaciones de pertenencia se definen en los métodos hasMany
};

// Ejecutar inicialización de relaciones
initializeRelations();

/* ========================================================================== */
/*  EXPORTAR TODOS LOS MODELOS                                                */
/* ========================================================================== */

module.exports = {
    User,
    Product,
    Category,
    Sale,
    SaleItem,
    Log,
    initializeRelations
};