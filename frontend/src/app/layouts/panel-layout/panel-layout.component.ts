import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout-admin">
      <aside class="sidebar">
        <h2 class="glow" style="margin-top:0">{{ appName }}</h2>
        <p class="text-muted" style="font-size:0.85rem">Panel administrador</p>
        <nav>
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
          <a routerLink="/admin/productos" routerLinkActive="active">Inventario</a>
          <a routerLink="/admin/ventas" routerLinkActive="active">Ventas</a>
          <a routerLink="/admin/cierre-caja" routerLinkActive="active">Cierre de caja</a>
          <a routerLink="/admin/usuarios" routerLinkActive="active">Usuarios</a>
        </nav>
        <button class="btn btn-danger" style="margin-top:2rem;width:100%" (click)="logout()">Cerrar sesión</button>
      </aside>
      <section class="main-content">
        <router-outlet />
      </section>
    </div>
  `,
})
export class AdminLayoutComponent {
  readonly appName = environment.appName;
  private readonly auth = inject(AuthService);
  logout(): void { this.auth.logout(); }
}

@Component({
  selector: 'app-cajero-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout-admin">
      <aside class="sidebar">
        <h2 class="glow" style="margin-top:0">{{ appName }}</h2>
        <p class="text-muted" style="font-size:0.85rem">Panel cajero</p>
        <nav>
          <a routerLink="/cajero" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">POS</a>
          <a routerLink="/cajero/historial" routerLinkActive="active">Historial</a>
        </nav>
        <button class="btn btn-danger" style="margin-top:2rem;width:100%" (click)="logout()">Cerrar sesión</button>
      </aside>
      <section class="main-content">
        <router-outlet />
      </section>
    </div>
  `,
})
export class CajeroLayoutComponent {
  readonly appName = environment.appName;
  private readonly auth = inject(AuthService);
  logout(): void { this.auth.logout(); }
}
