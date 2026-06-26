# Mr. Luigi — Despliegue

## Tres entornos

| Entorno | Backend | Frontend | Config Angular |
|---------|---------|----------|----------------|
| **Local** | `localhost:3007` | `localhost:5507` | `environment.local.ts` |
| **Docker/LAN** | contenedor `:3007` | nginx `:5507` | `environment.docker.ts` |
| **Producción** | hosting API | hosting estático | `environment.prod.ts` |

## Local

```powershell
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run start:local
```

## Docker (rebuild completo)

```powershell
powershell -ExecutionPolicy Bypass -File scripts/docker-rebuild.ps1
```

Levanta PostgreSQL + API + frontend en:
- API: http://localhost:3007/api
- Web: http://localhost:5507

## Producción

1. Configurar `frontend/src/environments/environment.prod.ts` con URLs del hosting.
2. Configurar `backend/.env` en el servidor con `NODE_ENV=production`.
3. Build:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build-prod.ps1
```

4. Push a GitHub → el hosting privado actualiza automáticamente (configurar workflow en `.github/workflows/deploy.yml`).

## Variables producción (ejemplo)

```env
PORT=3007
NODE_ENV=production
FRONTEND_URL=https://tudominio.com
DB_HOST=...
JWT_SECRET=...
```

## GitHub Actions

Plantilla en `.github/workflows/deploy.yml` — ajustar secrets y rutas del hosting privado.
