import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/app.models';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1 class="glow">Catálogo</h1>
    @if (loading) { <p class="text-muted">Cargando...</p> }
    <div class="grid">
      @for (p of products; track p.id) {
        <article class="card">
          @if (p.imagen_url) { <img [src]="imageUrl(p.imagen_url)" [alt]="p.nombre" /> }
          <h3>{{ p.nombre }}</h3>
          <p>{{ p.descripcion }}</p>
          <p class="text-accent">{{ p.precio | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
        </article>
      }
    </div>
  `,
  styles: [`
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem; }
    img { width: 100%; height: 160px; object-fit: cover; border-radius: 0.5rem; }
  `],
})
export class CatalogComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  private readonly api = inject(ProductService);
  private readonly uploads = inject(ApiService);

  ngOnInit(): void {
    this.api.list().subscribe({
      next: (res) => { this.products = res.data ?? []; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  imageUrl(path: string): string { return this.uploads.uploadUrl(path); }
}
