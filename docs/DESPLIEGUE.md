# Mr. Luigi — Despliegue

## Entornos

| Entorno | Backend | Frontend | Config Angular | Build |
|---------|---------|----------|----------------|-------|
| **Local** | `localhost:3007` | `localhost:5507` | `environment.local.ts` | `npm run start:local` |
| **Docker/LAN** | contenedor `:3007` | nginx `:5507` | `environment.docker.ts` | `npm run build:docker` |
| **GitHub Pages** | — (sin API) | https://edwardroag.github.io/mr_luigi/ | `environment.github.ts` | `npm run build:github` |
| **Producción** | hosting API propio | dominio propio | `environment.prod.ts` | `npm run build:prod` |

---

## Local

```powershell
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

- API: http://localhost:3007/api
- Web: http://localhost:5507

---

## Docker (rebuild completo)

```powershell
powershell -ExecutionPolicy Bypass -File scripts/docker-rebuild.ps1
```

Levanta PostgreSQL + API + frontend:

- API: http://localhost:3007/api
- Web: http://localhost:5507
- PostgreSQL: puerto **5433** en el host

---

## GitHub Pages (demo / vitrina estática)

Tras cada **push a `main`**, el workflow `.github/workflows/deploy.yml` compila y publica el frontend.

### URL pública

**https://edwardroag.github.io/mr_luigi/**

El enlace también aparece en **Actions → run → job `deploy` → Summary**.

### Activar Pages (una sola vez)

1. Repo GitHub → **Settings** → **Pages**
2. **Build and deployment** → Source: **GitHub Actions**
3. Push a `main` y esperar que termine el workflow

### Build manual (GitHub Pages)

```powershell
cd frontend
npm run build:github
```

Usa `baseHref: /mr_luigi/` y `environment.github.ts`.

### Limitaciones en GitHub Pages

| Funciona | No funciona (sin API desplegada) |
|----------|----------------------------------|
| UI, logos, fondos en `public/assets/` | Login staff |
| Navegación vitrina (inicio, catálogo, contacto) | Catálogo con productos reales |
| WhatsApp link | Imágenes de productos desde `/uploads` |
| | POS, inventario, reportes |

### Assets en GitHub Pages

GitHub Pages sirve el sitio en la subruta `/mr_luigi/`, no en la raíz del dominio.

- Los assets estáticos deben estar en `frontend/public/assets/` y **commiteados** en git.
- El servicio `AssetService` resuelve rutas con `APP_BASE_HREF` para que logos y fondos CSS apunten a `/mr_luigi/assets/...` en Pages y a `/assets/...` en local.
- Las fotos de **productos del catálogo** vienen del API (`uploadsUrl`); no aparecerán en Pages hasta desplegar el backend.

---

## Producción (hosting privado)

1. Configurar `frontend/src/environments/environment.prod.ts` con URLs reales del API y dominio.
2. Configurar `backend/.env` en el servidor con `NODE_ENV=production`.
3. Build:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build-prod.ps1
```

4. Subir artefactos al hosting (SSH, panel, Docker, etc.).

### Variables producción (ejemplo backend)

```env
PORT=3007
NODE_ENV=production
FRONTEND_URL=https://tudominio.com
DB_HOST=...
DB_NAME=mr_luigi_db
DB_USER=mr_luigi_user
DB_PASSWORD=...
JWT_SECRET=...
```

---

## GitHub Actions

Workflow: `.github/workflows/deploy.yml`

| Job | Qué hace |
|-----|----------|
| `build` | `npm ci` + `npm run build:github` + sube artefacto Pages |
| `deploy` | Publica en GitHub Pages y muestra URL en el summary |

Node.js **22** en el runner.

Para despliegue completo (API + BD), añadir pasos al workflow o un pipeline separado hacia el hosting privado.

---

## Matriz de builds Angular

| Script | Configuración | Destino |
|--------|---------------|---------|
| `npm run start:local` | `local` | Dev local :5507 |
| `npm run build:docker` | `docker` | Contenedor nginx |
| `npm run build:github` | `github` | GitHub Pages |
| `npm run build:prod` | `production` | Hosting con dominio propio |
