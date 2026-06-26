import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/app.models';
import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="hero card" [style.background-image]="'var(--asset-character-gaming)'">
      <div class="hero-content">
        <h1 class="glow">Bienvenido a {{ appName }}</h1>
        <p>Tu tienda gaming de confianza — juegos, consolas, accesorios y reparación.</p>
        <div class="actions">
          <a routerLink="/catalogo" class="btn btn-primary">Ver catálogo</a>
          <a [href]="whatsappLink" target="_blank" class="btn btn-accent">WhatsApp</a>
        </div>
      </div>
    </section>

    <section style="margin-top:2rem">
      <h2>Destacados</h2>
      @if (loading) { <p class="text-muted">Cargando productos...</p> }
      @if (error) { <p class="text-muted">Catálogo en modo demo. Conecta el backend para ver productos reales.</p> }
      <div class="grid">
        @for (p of products; track p.id) {
          <article class="card product-card">
            @if (p.imagen_url) {
              <img [src]="imageUrl(p.imagen_url)" [alt]="p.nombre" />
            }
            <h3>{{ p.nombre }}</h3>
            <p class="text-accent">{{ p.precio | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
            <span class="badge" [class.badge-admin]="p.stock > 0">{{ p.stock > 0 ? 'Disponible' : 'Vendido' }}</span>
          </article>
        }
      </div>
    </section>
  `,
  styles: [`
    .hero {
      min-height: 320px; background-size: cover; background-position: center;
      display: flex; align-items: flex-end; position: relative; overflow: hidden;
    }
    .hero::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(transparent 20%, rgba(15,10,26,0.95));
    }
    .hero-content { position: relative; z-index: 1; padding: 1rem; }
    .actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
    .product-card img { width: 100%; height: 140px; object-fit: cover; border-radius: 0.5rem; }
  `],
})
export class HomeComponent implements OnInit {
  readonly appName = environment.appName;
  readonly whatsappLink = `https://wa.me/${environment.whatsappPhone}`;
  products: Product[] = [];
  loading = true;
  error = false;

  private readonly productsApi = inject(ProductService);
  private readonly api = inject(ApiService);

  ngOnInit(): void {
    this.productsApi.list({ destacado: true, limit: 8 }).subscribe({
      next: (res) => {
        this.products = res.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  imageUrl(path: string): string {
    return this.api.uploadUrl(path);
  }
}
