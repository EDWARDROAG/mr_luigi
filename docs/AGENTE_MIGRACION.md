# Mr. Luigi — Arquitectura del agente de migración

Este documento define el rol del **agente especializado en fronts y migración de tecnologías** para el proyecto Mr. Luigi.

## Misión del agente

1. **Escanear** proyectos origen (Luigi's Gaming, CoreX) antes de cada iteración.
2. **Preservar** identidad visual Luigi (colores, tipografías, assets).
3. **Replicar** arquitectura funcional CoreX (API, roles, módulos POS).
4. **Migrar** de React/HTML estático → **Angular 19** de forma incremental.
5. **Documentar** en `historial-usuario.md` y `docs/TRAZABILIDAD.md`.

## Reglas de oro

| Área | Origen | Regla |
|------|--------|-------|
| Backend | CoreX | Copiar/adaptar; no reinventar |
| Visual | Luigi's Gaming | Nunca copiar UI de CoreX |
| Puertos | Mr. Luigi | 3007 API / 5507 frontend |
| Entornos | 3 capas | local → docker → prod |

## Checklist por módulo

- [ ] API endpoint probado con backend levantado
- [ ] Pantalla Angular conectada al servicio
- [ ] Guard de rol aplicado si es ruta interna
- [ ] Entrada en TRAZABILIDAD.md
- [ ] Historia de usuario en historial-usuario.md si aplica

## Comandos de contexto rápido

```powershell
# Escanear estructura
Get-ChildItem -Recurse mr_luigi -Depth 2

# Levantar todo local
cd mr_luigi && npm run install:all && npm run dev

# Sincronizar assets Luigi
npm run sync:assets
```
