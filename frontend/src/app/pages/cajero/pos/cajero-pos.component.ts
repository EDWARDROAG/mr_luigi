import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, SaleService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/app.models';

@Component({
  selector: 'app-cajero-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Punto de venta</h1>
    <div class="pos-grid">
      <section class="card">
        <h3>Productos disponibles</h3>
        <div class="products">
          @for (p of available; track p.id) {
            <button class="product-btn" (click)="addToCart(p)" [disabled]="p.stock < 1">
              {{ p.nombre }} — {{ p.precio | currency:'COP':'symbol-narrow':'1.0-0' }}
            </button>
          }
        </div>
      </section>
      <section class="card">
        <h3>Carrito</h3>
        @for (item of cart; track item.product.id) {
          <p>{{ item.product.nombre }} x{{ item.qty }} = {{ item.product.precio * item.qty | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
        }
        <p><strong>Total: {{ total | currency:'COP':'symbol-narrow':'1.0-0' }}</strong></p>
        <label>Método de pago</label>
        <select class="input" [(ngModel)]="metodoPago">
          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
        </select>
        <input class="input" placeholder="Cliente (opcional)" [(ngModel)]="clienteNombre" />
        <button class="btn btn-primary" style="margin-top:0.75rem;width:100%" (click)="checkout()" [disabled]="!cart.length || processing">
          {{ processing ? 'Procesando...' : 'Registrar venta' }}
        </button>
        @if (message) { <p class="text-accent">{{ message }}</p> }
      </section>
    </div>
  `,
  styles: [`
    .pos-grid { display:grid; grid-template-columns:1fr 320px; gap:1rem; }
    @media (max-width:900px) { .pos-grid { grid-template-columns:1fr; } }
    .products { display:flex; flex-direction:column; gap:0.5rem; max-height:420px; overflow:auto; }
    .product-btn { text-align:left; padding:0.6rem; border-radius:0.5rem; border:1px solid rgba(124,58,237,0.3); background:rgba(15,10,26,0.5); color:var(--ml-text); cursor:pointer; }
    .product-btn:hover:not(:disabled) { border-color:var(--ml-accent); }
    .product-btn:disabled { opacity:0.5; cursor:not-allowed; }
  `],
})
export class CajeroPosComponent implements OnInit {
  available: Product[] = [];
  cart: Array<{ product: Product; qty: number }> = [];
  metodoPago = 'efectivo';
  clienteNombre = '';
  processing = false;
  message = '';

  private readonly products = inject(ProductService);
  private readonly sales = inject(SaleService);

  get total(): number {
    return this.cart.reduce((s, i) => s + i.product.precio * i.qty, 0);
  }

  ngOnInit(): void {
    this.products.list({ stock_min: 1 }).subscribe({
      next: (r) => this.available = (r.data ?? []).filter((p) => p.stock > 0),
      error: () => this.available = [],
    });
  }

  addToCart(product: Product): void {
    const existing = this.cart.find((c) => c.product.id === product.id);
    if (existing) existing.qty += 1;
    else this.cart.push({ product, qty: 1 });
  }

  checkout(): void {
    this.processing = true;
    this.message = '';
    this.sales.create({
      metodo_pago: this.metodoPago,
      cliente_nombre: this.clienteNombre || undefined,
      items: this.cart.map((c) => ({
        producto_id: c.product.id,
        cantidad: c.qty,
        precio_unitario: c.product.precio,
      })),
    }).subscribe({
      next: () => {
        this.cart = [];
        this.message = 'Venta registrada correctamente';
        this.processing = false;
        this.ngOnInit();
      },
      error: (err) => {
        this.message = err?.error?.message ?? 'Error al registrar venta';
        this.processing = false;
      },
    });
  }
}
