# Mr. Luigi — Vitrina pública

Tienda gaming **Mr. Luigi** — sitio público (vitrina Angular).

**Sitio en vivo:** https://edwardroag.github.io/mr_luigi/

---

## Este repositorio (GitHub público)

Contiene **solo lo necesario para la vitrina**:

| Incluido | No incluido (desarrollo local privado) |
|----------|----------------------------------------|
| `frontend/` — Angular vitrina | `backend/` — API Node.js |
| `frontend/public/assets/` — logos | `database/` — PostgreSQL |
| Workflows GitHub Actions | `docker/` — stack completo |
| Script deploy vitrina | Credenciales, `.env` |

> El backend, POS y panel admin se desarrollan **en local** y no se suben a este repo.

---

## Despliegue automático

Cada push a `main` ejecuta **Deploy vitrina (Pages)**:

1. Build Angular (`npm run build:github`)
2. Publica en GitHub Pages
3. URL en **Actions → Summary → View deployment**

Guía: [docs/DEPLOY-VITRINA.md](docs/DEPLOY-VITRINA.md)

---

## Desarrollo local (equipo interno)

El monorepo completo (backend + frontend + BD) vive **solo en la máquina del desarrollador**:

```powershell
npm run install:all
powershell -File database/setup-local.ps1
npm run seed
npm run dev
```

- Frontend: http://localhost:5507  
- API: http://localhost:3007/api  

Documentación interna en `docs/` (no se sube a GitHub).

---

## Comandos deploy vitrina

```powershell
node scripts/client-vitrina-deploy/detect-and-deploy.js --detect
node scripts/client-vitrina-deploy/detect-and-deploy.js --untrack-private
```

Ver [scripts/client-vitrina-deploy/README.md](scripts/client-vitrina-deploy/README.md).
