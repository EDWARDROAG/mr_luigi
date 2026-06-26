# Mr. Luigi — Trazabilidad de migración

| ID | Origen | Destino | Estado | Notas |
|----|--------|---------|--------|-------|
| TRZ-001 | CoreX `backend/src/server.js` | `backend/src/server.js` | ✅ | Puerto 3007, branding Mr. Luigi |
| TRZ-002 | CoreX `backend/src/config/database.js` | `backend/src/config/database.js` | ✅ | BD `mr_luigi_db` |
| TRZ-003 | CoreX `backend/src/controllers/*` | `backend/src/controllers/*` | ✅ | Copia directa |
| TRZ-004 | CoreX `backend/src/routes/*` | `backend/src/routes/*` | ✅ | Copia directa |
| TRZ-005 | CoreX `backend/src/models/*` | `backend/src/models/*` | ✅ | Copia directa |
| TRZ-006 | CoreX `backend/src/middlewares/*` | `backend/src/middlewares/*` | ✅ | Copia directa |
| TRZ-007 | CoreX `database/init-corex-postgres.sql` | `database/init-mr-luigi-postgres.sql` | ✅ | Esquema equivalente |
| TRZ-008 | CoreX React frontend (conceptual) | Angular `frontend/` | 🔄 | En progreso |
| TRZ-009 | Luigi's Gaming colores/tipografía | `frontend/src/styles/` | 🔄 | Tokens SCSS |
| TRZ-010 | Luigi's Gaming assets | `frontend/public/assets/` | ⏳ | Script sync-assets |
| TRZ-011 | CoreX auth JWT | `frontend/src/app/core/` | 🔄 | Auth service + guards |
| TRZ-012 | CoreX módulo ventas | `frontend/src/app/pages/cajero/` | 🔄 | POS base |
| TRZ-013 | CoreX inventario | `frontend/src/app/pages/admin/productos` | 🔄 | CRUD base |
| TRZ-014 | CoreX cierre caja | `frontend/src/app/pages/admin/cierre-caja` | 🔄 | Reportes |
| TRZ-015 | CoreX docker-compose dev | `docker/docker-compose.dev.yml` | ✅ | Stack completo |

**Leyenda:** ✅ Completado | 🔄 En progreso | ⏳ Pendiente

**Última actualización:** 2026-06-23
