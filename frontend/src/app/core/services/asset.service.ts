import { inject, Injectable } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AssetService {
  private readonly baseHref = inject(APP_BASE_HREF, { optional: true }) ?? '/';

  /** Ruta pública respetando base href (local `/`, GitHub Pages `/mr_luigi/`). */
  assetUrl(path: string): string {
    const normalized = path.replace(/^\//, '');
    const base = this.baseHref.endsWith('/') ? this.baseHref : `${this.baseHref}/`;
    return `${base}${normalized}`;
  }

  applyCssVars(): void {
    const root = document.documentElement;
    const assets: Record<string, string> = {
      '--asset-wave-white': 'assets/img/wave-white.png',
      '--asset-wave-pink': 'assets/img/wave-pink.png',
      '--asset-pattern-white-dots': 'assets/img/pattern-white-dots.png',
      '--asset-pattern-characters-red': 'assets/img/pattern-characters-red.png',
      '--asset-character-gaming': 'assets/img/wp2983043-super-mario-and-luigi-wallpaper.jpg',
      '--asset-pattern-yellow-dots': 'assets/img/pattern-yellow-dots.png',
    };
    for (const [name, path] of Object.entries(assets)) {
      root.style.setProperty(name, `url('${this.assetUrl(path)}')`);
    }
  }
}
