# Mr. Luigi — Contexto de migración

**Fecha inicio:** 2026-06-23  
**Proyecto:** Mr. Luigi (antes Luigi's Gaming)  
**Referencia funcional:** CoreX  
**Referencia visual:** Luigi's Gaming (`../luigis_gaming`)

---

## Objetivo

Migrar el sistema completo (backend + panel interno + vitrina) al stack **Angular 19 + Node.js/Express + PostgreSQL**, manteniendo la identidad visual gaming de Luigi's Gaming y la arquitectura de servicios de CoreX.

---

## Mapa de proyectos

| Proyecto | Rol | Ubicación |
|----------|-----|-----------|
| **CoreX** | Referencia backend, roles, módulos POS | `../CoreX` |
| **Luigi's Gaming** | Referencia visual, assets, vitrina | `../luigis_gaming` |
| **Mr. Luigi** | Proyecto destino (independiente) | `./` |

---

## Puertos

| Servicio | Puerto | Entorno |
|----------|--------|---------|
| API Backend | **3007** | local, docker, prod |
| Frontend Angular | **5507** | local, docker |
| PostgreSQL local | 5432 | desarrollo nativo |
| PostgreSQL Docker | 5433→5432 | docker-compose |

---

## Roles del sistema

| Rol | Acceso | Autenticación |
|-----|--------|---------------|
| **administrador** | Panel completo, usuarios, reportes, cierre de caja | JWT |
| **cajero** | POS, historial de ventas, inventario operativo | JWT |
| **cliente** | Vitrina pública (catálogo, contacto) | Sin login |

---

## Módulos migrados desde CoreX

| Módulo | API CoreX | Ruta Angular Admin | Ruta Angular Cajero |
|--------|-----------|-------------------|---------------------|
| Auth | `/api/auth` | `/login` | `/login` |
| Productos/Inventario | `/api/products` | `/admin/productos` | — |
| Ventas | `/api/sales` | `/admin/ventas` | `/cajero/pos` |
| Cierre de caja | `/api/reports/cashier-closure` | `/admin/cierre-caja` | — |
| Categorías | `/api/categories` | `/admin/categorias` | — |
| Usuarios | `/api/users` | `/admin/usuarios` | — |
| Logs | `/api/logs` | `/admin/logs` | — |

---

## Identidad visual (Luigi's Gaming → Mr. Luigi)

| Token | Valor | Uso |
|-------|-------|-----|
| Primary | `#7C3AED` | Botones, enlaces |
| Secondary | `#1E1B4B` | Fondos |
| Accent | `#F59E0B` | CTAs, promociones |
| Dark | `#0F0A1A` | Fondo general |
| Card | `#1A1430` | Tarjetas |
| Text | `#E2E8F0` | Texto principal |

**Tipografías:** Orbitron (títulos), Inter (cuerpo)

**Assets:** Reutilizar desde `../luigis_gaming/apps/web/public/assets/` vía script `scripts/sync-assets.ps1`

---

## Entornos

| Archivo | Uso |
|---------|-----|
| `environment.local.ts` | Desarrollo local (`localhost:3007`) |
| `environment.docker.ts` | Docker/LAN (API relativa `/api`) |
| `environment.prod.ts` | Producción (hosting privado) |

---

## Flujo de despliegue

```
Local (npm run dev) → Docker (scripts/docker-rebuild.ps1) → GitHub push → Hosting automático
```

Ver `docs/DESPLIEGUE.md` y `scripts/` para comandos.
