# Mr. Luigi — Instalación local

## Requisitos

- Node.js 18+
- PostgreSQL 14+ (o Docker)
- Angular CLI 19 (incluido en `frontend/node_modules`)

## 1. Base de datos

### Opción A — Script PowerShell

```powershell
powershell -ExecutionPolicy Bypass -File database/setup-local.ps1
```

### Opción B — Docker solo PostgreSQL

```powershell
docker compose -f docker/docker-compose.dev.yml up -d postgres
```

## 2. Backend (puerto 3007)

```powershell
cd backend
copy .env.example .env
npm install
npm run seed
npm run dev
```

API: http://localhost:3007/api/health

## 3. Frontend (puerto 5507)

```powershell
cd frontend
npm install
npm run start:local
```

App: http://localhost:5507

## 4. Sincronizar assets de Luigi's Gaming

```powershell
powershell -ExecutionPolicy Bypass -File scripts/sync-assets.ps1
```

## Credenciales seed

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@mrluigi.local | MrLuigi2026Admin |

## Comandos raíz

```powershell
npm run dev          # backend + frontend en paralelo
npm run dev:backend
npm run dev:frontend
```
