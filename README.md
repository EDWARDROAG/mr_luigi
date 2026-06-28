# Mr. Luigi

Tienda gaming **Mr. Luigi** — migración desde Luigi's Gaming con arquitectura backend de CoreX.

## Stack

- **Frontend:** Angular 19 (puerto 5507)
- **Backend:** Node.js + Express (puerto 3007)
- **Base de datos:** PostgreSQL

## URLs

| Entorno | Frontend | API |
|---------|----------|-----|
| **Local** | http://localhost:5507 | http://localhost:3007/api |
| **GitHub Pages** | https://edwardroag.github.io/mr_luigi/ | Requiere hosting aparte |

## Inicio rápido

```powershell
npm run install:all

# Backend: copiar backend/.env.example → backend/.env y ajustar DB_PASSWORD
# PostgreSQL: copiar .env.postgres.local.example → .env.postgres.local (contraseña superusuario)
powershell -File database/setup-local.ps1

npm run seed
npm run dev
```

## Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Backend + frontend en paralelo (desde la raíz) |
| `npm run dev:backend` | Solo API (puerto 3007) |
| `npm run dev:frontend` | Solo Angular (puerto 5507) |
| `npm run seed` | Datos iniciales (admin, categorías, productos demo) |
| `npm run sync:assets` | Copia imágenes desde `../luigis_gaming` |
| `npm run docker:rebuild` | Stack completo con Docker |
| `npm run build:prod` | Build de producción (hosting privado) |

Desde `frontend/` también puedes usar `npm run dev` (equivale a `start:local`).

## Documentación

- [Instalación local](docs/INSTALACION.md)
- [Despliegue y GitHub Pages](docs/DESPLIEGUE.md)
- [Contexto de migración](docs/CONTEXTO_MIGRACION.md)
- [Trazabilidad](docs/TRAZABILIDAD.md)
- [Roles y permisos](docs/ROLES.md)
- [Historial de usuario](historial-usuario.md)

## Proyectos de referencia

| Proyecto | Uso |
|----------|-----|
| `../CoreX` | Backend, roles, módulos POS |
| `../luigis_gaming` | Identidad visual y assets |

## Entornos Angular

| Archivo | Uso |
|---------|-----|
| `environment.local.ts` | Desarrollo local |
| `environment.docker.ts` | Docker / LAN |
| `environment.github.ts` | GitHub Pages (`baseHref: /mr_luigi/`) |
| `environment.prod.ts` | Hosting privado con dominio propio |

## Credenciales seed (local)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@mrluigi.local | MrLuigi2026Admin |
