# Mr. Luigi — Deploy vitrina (GitHub Pages)

Publicación automática de **solo la vitrina** (frontend Angular compilado) en GitHub Pages. El backend, admin y archivos sensibles **no** se publican.

**URL del sitio:** https://edwardroag.github.io/mr_luigi/

---

## Arquitectura del deploy

```
frontend/public/assets/     → commiteados en git (logos, fondos)
         ↓
npm run build:github        → frontend/dist/frontend/browser/
         ↓
GitHub Actions              → publica artefacto en Pages
         ↓
https://edwardroag.github.io/mr_luigi/
```

| Qué se publica | Qué NO se publica |
|----------------|-------------------|
| Angular compilado (vitrina) | `backend/` |
| Assets en `public/assets/` | `.env`, credenciales |
| UI pública (inicio, catálogo, contacto) | POS, panel admin, API |

---

## Workflows en GitHub Actions

| Workflow | Archivo | Qué hace | ¿Muestra URL? |
|----------|---------|----------|---------------|
| **Deploy vitrina (Pages)** | `.github/workflows/deploy-vitrina.yml` | Build + publica en Pages | ✅ Summary + **View deployment** |
| **CI vitrina** | `.github/workflows/ci.yml` | Smoke test de archivos | ❌ Solo verifica (muestra URL esperada) |

> **No confundir:** CI vitrina no publica. Para ver el sitio en vivo, revisar el run de **Deploy vitrina (Pages)**.

### Flujo automático (push a `main`)

1. Checkout del repo
2. `npm ci` + `npm run build:github` en `frontend/`
3. Copia `index.html` → `404.html` (fallback SPA)
4. Verifica `index.html` y `assets/img/logo.png`
5. Sube artefacto y publica en GitHub Pages
6. Muestra URL en logs y Summary del job

---

## Script portable: `client-vitrina-deploy`

Carpeta: `scripts/client-vitrina-deploy/`

Script principal: `detect-and-deploy.js` — detecta la vitrina, genera workflows y permite probar localmente.

### Comandos

Desde la **raíz del proyecto**:

```powershell
# 1. Detectar carpeta vitrina
node scripts/client-vitrina-deploy/detect-and-deploy.js --detect

# 2. Build Angular (requerido antes de prepare-local)
cd frontend && npm run build:github && cd ..

# 3. Copia filtrada para prueba local
node scripts/client-vitrina-deploy/detect-and-deploy.js --prepare-local
npx serve deploy-vitrina -p 8080

# 4. Regenerar workflows (si cambia PROJECT_CONFIG)
node scripts/client-vitrina-deploy/detect-and-deploy.js --init-workflow --force
node scripts/client-vitrina-deploy/detect-and-deploy.js --init-ci --force
```

### Configuración Mr. Luigi (`PROJECT_CONFIG`)

| Campo | Valor |
|-------|-------|
| `vitrinaCandidates[0]` | `frontend/dist/frontend/browser` |
| `build` | `npm ci` + `npm run build:github` + fallback 404 |
| `deployVerifyFiles` | `assets/img/logo.png` |
| `ciSmokeFiles` | `assets/img/logo.png`, `logo_favicon.png` |
| `ciDirs` | `assets/img` |

Editar en `scripts/client-vitrina-deploy/detect-and-deploy.js` si cambia la estructura del proyecto.

---

## Activar GitHub Pages (una sola vez)

1. Repo → **Settings** → **Pages**
2. **Build and deployment** → Source: **GitHub Actions**
3. Push a `main`
4. **Actions** → **Deploy vitrina (Pages)** → ver **View deployment** y URL en Summary

---

## Assets e imágenes en Pages

GitHub Pages sirve el sitio en la subruta `/mr_luigi/`.

| Recurso | Ubicación en repo | Cómo se resuelve en Pages |
|---------|-------------------|---------------------------|
| Logos, fondos, patrones | `frontend/public/assets/img/` | `/mr_luigi/assets/img/...` |
| Favicon | `frontend/public/assets/img/logo_favicon.png` | vía `<base href="/mr_luigi/">` |
| Fotos de productos | API `/uploads` | ❌ Requiere backend desplegado |

**Reglas:**

- Los assets deben estar **commiteados** en git (no solo en local).
- `AssetService` usa `APP_BASE_HREF` para rutas correctas en local y Pages.
- Sincronizar desde Luigi's Gaming: `npm run sync:assets`

---

## Limitaciones de la vitrina en Pages

| Funciona | No funciona (sin API) |
|----------|------------------------|
| UI, logos, fondos gaming | Login staff |
| Navegación pública | Catálogo con datos reales |
| Link WhatsApp | Imágenes de productos del API |
| | POS, inventario, reportes |

---

## Qué subir a git vs qué ignorar

### Repo público GitHub (solo vitrina)

```powershell
node scripts/client-vitrina-deploy/detect-and-deploy.js --untrack-private
git commit -m "chore: repo público solo vitrina"
git push
```

Esto **saca del índice git** (pero mantiene en disco local):

| Sacado de GitHub | Permanece local |
|------------------|-----------------|
| `backend/` | ✅ Sí |
| `database/`, `docker/` | ✅ Sí |
| Docs internos, historial | ✅ Sí |
| Scripts docker/build/sync | ✅ Sí |
| `package.json` raíz (monorepo) | ✅ Sí |

### Qué SÍ queda en el repo público

- `frontend/` — código Angular (incluye rutas admin en fuente; sin API no funcionan)
- `frontend/public/assets/` — logos e imágenes
- `scripts/client-vitrina-deploy/`
- `.github/workflows/deploy-vitrina.yml` y `ci.yml`
- `docs/DEPLOY-VITRINA.md`
- `README.md`

> **Nota:** El código fuente de rutas `/admin` y `/cajero` está en `frontend/src/` pero **no hay backend ni secretos** en GitHub. Para ocultar también esas pantallas del repo haría falta separar `frontend-public` (fase futura).

### Ignorar (`.gitignore` automático con `--untrack-private`)

- Todo lo listado en `privateGitPaths` del script
- `node_modules/`, `dist/`, `deploy-vitrina/`
- `.env`, credenciales

---

## Build manual

```powershell
cd frontend
npm run build:github
```

Salida: `frontend/dist/frontend/browser/`  
Config: `environment.github.ts` + `baseHref: /mr_luigi/`

---

## Solución de problemas

| Problema | Solución |
|----------|----------|
| Pages muestra README del repo | Verificar Source: GitHub Actions y workflow **Deploy vitrina** |
| Logos no cargan en Pages | Commitear `frontend/public/assets/`; verificar `AssetService` |
| CI falla: falta logo | Ejecutar `npm run sync:assets` y commit |
| No aparece View deployment | Ejecutar **Deploy vitrina**, no CI vitrina |
| Productos sin foto | Normal sin API; desplegar backend aparte |

---

## Referencias

- [Despliegue general](DESPLIEGUE.md)
- [Instalación local](INSTALACION.md)
- [Assets públicos](../frontend/public/assets/README.md)
- [Script README](../scripts/client-vitrina-deploy/README.md)
