import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/app.models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Inventario</h1>
    <div class="card" style="margin-bottom:1rem">
      <h3>Nuevo producto</h3>
      <div class="form-grid">
        <input class="input" placeholder="Nombre" [(ngModel)]="form.nombre" />
        <input class="input" type="number" placeholder="Precio" [(ngModel)]="form.precio" />
        <input class="input" type="number" placeholder="Stock" [(ngModel)]="form.stock" />
        <button class="btn btn-primary" (click)="create()">Agregar</button>
      </div>
    </div>
    <table class="table card">
      <thead><tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Stock</th><th></th></tr></thead>
      <tbody>
        @for (p of products; track p.id) {
          <tr>
            <td>{{ p.id }}</td>
            <td>{{ p.nombre }}</td>
            <td>{{ p.precio | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
            <td>{{ p.stock }}</td>
            <td><button class="btn btn-danger" (click)="remove(p.id)">Eliminar</button></td>
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: [`.form-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:0.75rem; }`],
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  form: Partial<Product> = { nombre: '', precio: 0, stock: 1 };
  private readonly api = inject(ProductService);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.list().subscribe({ next: (r) => this.products = r.data ?? [] });
  }

  create(): void {
    if (!this.form.nombre) return;
    this.api.create(this.form).subscribe({ next: () => { this.form = { nombre: '', precio: 0, stock: 1 }; this.load(); } });
  }

  remove(id: number): void {
    if (confirm('¿Eliminar producto?')) this.api.remove(id).subscribe({ next: () => this.load() });
  }
}
