# Assets públicos — Mr. Luigi

Imágenes, logos y videos servidos como archivos estáticos del frontend.

## Ubicación

```
frontend/public/assets/
├── img/          # logos, fondos, patrones, hero
└── videos/       # clips de vitrina (opcional)
```

## Sincronizar desde Luigi's Gaming

Desde la raíz del proyecto:

```powershell
npm run sync:assets
```

Orígenes (en orden):

1. `../luigis_gaming/referencias_cliente/assets`
2. `../luigis_gaming/apps/web/public/assets`

## GitHub Pages

Los assets deben estar **commiteados en git** para aparecer en:

https://edwardroag.github.io/mr_luigi/

El servicio `AssetService` resuelve rutas según el entorno:

| Entorno | Ejemplo logo |
|---------|----------------|
| Local | `/assets/img/logo.png` |
| GitHub Pages | `/mr_luigi/assets/img/logo.png` |

## Uso en código

```typescript
// Componentes
readonly logoUrl = inject(AssetService).assetUrl('assets/img/logo.png');

// Fondos CSS (variables en public-layout)
this.assets.applyCssVars();
```

## Archivos principales

| Archivo | Uso |
|---------|-----|
| `logo.png` | Header vitrina |
| `logo_favicon.png` | Favicon |
| `hero.jpg` / wallpaper | Sección inicio |
| `wave-*.png`, `pattern-*.png` | Decoración gaming |
