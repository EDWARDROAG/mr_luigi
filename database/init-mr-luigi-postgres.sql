-- Mr. Luigi - Esquema PostgreSQL (migrado desde CoreX)
-- Base de datos independiente para el proyecto Mr. Luigi

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'cajero')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    tipo VARCHAR(50) NOT NULL,
    descripcion TEXT DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(12, 2) NOT NULL,
    condicion VARCHAR(20) CHECK (condicion IN ('nuevo', 'segunda')),
    categoria_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    imagen_url VARCHAR(500),
    destacado BOOLEAN DEFAULT FALSE,
    stock INTEGER DEFAULT 1,
    fecha_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    vendedor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    cliente_nombre VARCHAR(255),
    cliente_telefono VARCHAR(50),
    metodo_pago VARCHAR(50),
    comprobante_url VARCHAR(500),
    total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    fecha_venta TIMESTAMP NOT NULL DEFAULT NOW(),
    estado VARCHAR(20) NOT NULL DEFAULT 'completada',
    motivo_cancelacion TEXT,
    fecha_cancelacion TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    accion VARCHAR(100) NOT NULL,
    detalle TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_categoria ON products(categoria_id);
CREATE INDEX IF NOT EXISTS idx_products_destacado ON products(destacado);
CREATE INDEX IF NOT EXISTS idx_sales_vendedor ON sales(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_sales_fecha ON sales(fecha_venta);
CREATE INDEX IF NOT EXISTS idx_logs_usuario ON logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_created ON logs(created_at);
