# Mr. Luigi — Instalación local

## Requisitos

- Node.js 18+ (22 recomendado para CI)
- PostgreSQL 14+ (o Docker)
- Angular CLI 19 (incluido en `frontend/node_modules`)

## 1. Dependencias

Desde la raíz del proyecto:

```powershell
npm run install:all
```

O por carpeta:

```powershell
cd backend && npm install
cd ../frontend && npm install
cd .. && npm install   # concurrently en la raíz
```

## 2. Variables de entorno

### Backend (`backend/.env`)

```powershell
copy backend\.env.example backend\.env
```

Ajustar al menos:

| Variable | Descripción |
|----------|-------------|
| `DB_PASSWORD` | Contraseña del usuario `mr_luigi_user` |
| `JWT_SECRET` | Clave larga y única para tokens |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Usuario admin del seed |

### PostgreSQL superusuario (setup local)

```powershell
copy .env.postgres.local.example .env.postgres.local
```

Editar `POSTGRES_PASSWORD` con la contraseña del usuario `postgres` de tu instalación local.

> Este archivo está en `.gitignore` y no se sube a GitHub.

## 3. Base de datos

### Opción A — Script PowerShell (recomendado)

```powershell
powershell -File database/setup-local.ps1
```

Crea usuario `mr_luigi_user`, base `mr_luigi_db` y aplica el esquema SQL.

### Opción B — Docker solo PostgreSQL

```powershell
docker compose -f docker/docker-compose.dev.yml up -d postgres
```

PostgreSQL expuesto en el puerto **5433** (mapeo interno 5432). Ajustar `DB_PORT=5433` en `backend/.env` si usas esta opción.

## 4. Seed (datos iniciales)

```powershell
cd backend
npm run seed
```

Crea administrador, 12 categorías y 10 productos de ejemplo.

## 5. Levantar la aplicación

### Todo junto (recomendado)

Desde la raíz:

```powershell
npm run dev
```

### Por separado

**Backend (puerto 3007):**

```powershell
cd backend
npm run dev
```

Health check: http://localhost:3007/api/health

**Frontend (puerto 5507):**

```powershell
cd frontend
npm run dev
# o: npm run start:local
```

App: http://localhost:5507

## 6. Assets visuales

Los assets viven en `frontend/public/assets/` y deben estar versionados en git.

Para sincronizar desde Luigi's Gaming:

```powershell
npm run sync:assets
```

Orígenes del script:

- `../luigis_gaming/referencias_cliente/assets`
- `../luigis_gaming/apps/web/public/assets`

## Credenciales seed

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@mrluigi.local | MrLuigi2026Admin |

Cambiar la contraseña tras el primer login en entornos reales.

## Solución de problemas

| Problema | Solución |
|----------|----------|
| `Missing script: "dev"` en `frontend/` | Usar `npm run dev` o `npm run start:local` (alias añadido) |
| Puerto 3007 en uso | Cerrar otra instancia del backend o cambiar `PORT` en `.env` |
| Error de conexión PostgreSQL | Verificar servicio PostgreSQL y credenciales en `.env` |
| Imágenes no cargan en GitHub Pages | Ver [Despliegue — Assets en GitHub Pages](DESPLIEGUE.md#assets-en-github-pages) |

## Comandos raíz

```powershell
npm run dev           # backend + frontend
npm run dev:backend
npm run dev:frontend
npm run seed
npm run sync:assets
npm run docker:rebuild
```
