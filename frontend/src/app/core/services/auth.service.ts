import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { tap, catchError, of, map } from 'rxjs';
import { ApiService } from './api.service';
import { AuthResponse, User, UserRole } from '../models/app.models';

const TOKEN_KEY = 'mr_luigi_token';
const USER_KEY = 'mr_luigi_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly userSignal = signal<User | null>(this.loadUser());
  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.getToken() && !!this.userSignal());
  readonly isAdmin = computed(() => this.userSignal()?.role === 'admin');
  readonly isCajero = computed(() => {
    const role = this.userSignal()?.role;
    return role === 'cajero' || role === 'admin';
  });

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(email: string, password: string) {
    return this.api.post<AuthResponse>('/auth/login', { email, password }).pipe(
      tap((res) => {
        if (res.token && res.user) {
          localStorage.setItem(TOKEN_KEY, res.token);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          this.userSignal.set(res.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  hasRole(roles: UserRole[]): boolean {
    const role = this.userSignal()?.role;
    return !!role && roles.includes(role);
  }

  verifySession() {
    const token = this.getToken();
    if (!token) return of(false);
    return this.api.get<{ success: boolean; user: User }>('/auth/verify').pipe(
      tap((res) => {
        if (res.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          this.userSignal.set(res.user);
        }
      }),
      map(() => true),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
