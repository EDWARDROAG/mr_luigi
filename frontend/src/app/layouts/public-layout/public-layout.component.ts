import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { AssetService } from '../../core/services/asset.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout-public">
      <header class="header">
        <a routerLink="/" class="brand">
          <img src="assets/img/logo.png" alt="Mr. Luigi" class="logo" onerror="this.style.display='none'" />
          <span class="glow">{{ appName }}</span>
        </a>
        <nav class="nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Inicio</a>
          <a routerLink="/catalogo" routerLinkActive="active">Catálogo</a>
          <a routerLink="/contacto" routerLinkActive="active">Contacto</a>
          <a routerLink="/login" class="btn btn-accent">Acceso staff</a>
        </nav>
      </header>
      <main class="main-content">
        <router-outlet />
      </main>
      <footer class="footer">
        <p>&copy; {{ year }} {{ appName }} — Gaming Store</p>
        <a [href]="whatsappLink" target="_blank" rel="noopener">WhatsApp</a>
      </footer>
    </div>
  `,
  styles: [`
    .header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.5rem; background: rgba(31, 41, 55, 0.95);
      border-bottom: 2px solid var(--ml-accent);
    }
    .brand { display: flex; align-items: center; gap: 0.75rem; color: var(--ml-text); font-family: var(--font-gaming); font-weight: 700; }
    .logo { height: 48px; width: auto; }
    .nav { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
    .nav a { color: var(--ml-text-light); }
    .nav a.active { color: var(--ml-accent); }
    .footer {
      margin-top: auto; padding: 1.5rem; text-align: center;
      background: #000; color: var(--ml-text-light);
      display: flex; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;
    }
  `],
})
export class PublicLayoutComponent implements OnInit {
  readonly appName = environment.appName;
  readonly year = new Date().getFullYear();
  readonly whatsappLink = `https://wa.me/${environment.whatsappPhone}`;
  private readonly assets = inject(AssetService);

  ngOnInit(): void {
    this.assets.applyCssVars();
  }
}
