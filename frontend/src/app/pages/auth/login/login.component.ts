import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrap">
      <form class="card login-card" (ngSubmit)="submit()">
        <h1 class="glow">{{ appName }}</h1>
        <p class="text-muted">Acceso staff — administrador o cajero</p>
        @if (error()) { <p class="error">{{ error() }}</p> }
        <label>Email</label>
        <input class="input" type="email" [(ngModel)]="email" name="email" required />
        <label>Contraseña</label>
        <input class="input" type="password" [(ngModel)]="password" name="password" required />
        <button class="btn btn-primary" type="submit" [disabled]="loading()">
          {{ loading() ? 'Ingresando...' : 'Iniciar sesión' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .login-wrap { min-height: 80vh; display: grid; place-items: center; }
    .login-card { width: min(400px, 92vw); display: grid; gap: 0.75rem; }
    label { font-size: 0.85rem; color: var(--ml-text-light); }
    .error { color: var(--ml-danger); }
  `],
})
export class LoginComponent {
  readonly appName = environment.appName;
  email = '';
  password = '';
  readonly loading = signal(false);
  readonly error = signal('');

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  submit(): void {
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        if (this.auth.isAdmin()) this.router.navigate(['/admin']);
        else if (this.auth.isCajero()) this.router.navigate(['/cajero']);
        else this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Credenciales inválidas');
      },
    });
  }
}
