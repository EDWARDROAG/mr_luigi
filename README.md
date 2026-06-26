# Mr. Luigi

Tienda gaming **Mr. Luigi** — migración desde Luigi's Gaming con arquitectura backend de CoreX.

## Stack

- **Frontend:** Angular 19 (puerto 5507)
- **Backend:** Node.js + Express (puerto 3007)
- **Base de datos:** PostgreSQL

## Inicio rápido

```powershell
npm run install:all
# Configurar backend/.env (copiar de backend/.env.example)
npm run seed
npm run dev
```

- Web: http://localhost:5507
- API: http://localhost:3007/api

## Documentación

- [Instalación](docs/INSTALACION.md)
- [Despliegue](docs/DESPLIEGUE.md)
- [Contexto de migración](docs/CONTEXTO_MIGRACION.md)
- [Trazabilidad](docs/TRAZABILIDAD.md)
- [Historial de usuario](historial-usuario.md)

## Proyectos de referencia

| Proyecto | Uso |
|----------|-----|
| `../CoreX` | Backend, roles, módulos POS |
| `../luigis_gaming` | Identidad visual y assets |

## Entornos

| Entorno | Comando |
|---------|---------|
| Local | `npm run dev` |
| Docker | `npm run docker:rebuild` |
| Producción | `npm run build:prod` |
# mr_luigi
