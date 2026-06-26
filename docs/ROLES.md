# Mr. Luigi — Roles y permisos

## Roles del sistema

| Rol | Código | Autenticación | Descripción |
|-----|--------|---------------|-------------|
| **Administrador** | `admin` | JWT | Acceso total: usuarios, inventario, ventas, cierre de caja, logs, backups |
| **Cajero** | `cajero` | JWT | POS, historial de ventas propias, inventario operativo |
| **Cliente** | — | Sin login | Vitrina pública: inicio, catálogo, contacto, WhatsApp |

> El rol **cliente** no existe en la tabla `users`; representa el visitante de la tienda pública.

## Rutas Angular por rol

### Público (cliente)
- `/` — Inicio
- `/catalogo` — Catálogo
- `/contacto` — Contacto

### Administrador
- `/admin` — Dashboard
- `/admin/productos` — Inventario
- `/admin/ventas` — Ventas
- `/admin/cierre-caja` — Cierre de caja
- `/admin/usuarios` — Usuarios (CRUD pendiente UI)

### Cajero
- `/cajero` — Punto de venta (POS)
- `/cajero/historial` — Historial de ventas

## API (heredada de CoreX)

| Endpoint | admin | cajero | público |
|----------|-------|--------|---------|
| `POST /api/auth/login` | ✓ | ✓ | ✓ |
| `GET /api/products` | ✓ | ✓ | ✓ |
| `POST /api/products` | ✓ | — | — |
| `POST /api/sales` | ✓ | ✓ | — |
| `GET /api/reports/cashier-closure` | ✓ | — | — |
| `GET /api/users` | ✓ | — | — |

## Credenciales iniciales (seed)

```
Email:    admin@mrluigi.local
Password: MrLuigi2026Admin
```

Cambiar en producción tras el primer despliegue.
