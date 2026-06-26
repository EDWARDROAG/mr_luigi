import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaleService } from '../../../core/services/product.service';
import { Sale } from '../../../core/models/app.models';

@Component({
  selector: 'app-cajero-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Historial de ventas</h1>
    <table class="table card">
      <thead><tr><th>ID</th><th>Fecha</th><th>Cliente</th><th>Total</th><th>Estado</th></tr></thead>
      <tbody>
        @for (s of sales; track s.id) {
          <tr>
            <td>{{ s.id }}</td>
            <td>{{ s.fecha_venta | date:'short' }}</td>
            <td>{{ s.cliente_nombre || '—' }}</td>
            <td>{{ s.total | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
            <td>{{ s.estado }}</td>
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class CajeroHistoryComponent implements OnInit {
  sales: Sale[] = [];
  private readonly api = inject(SaleService);

  ngOnInit(): void {
    this.api.list().subscribe({ next: (r) => this.sales = r.data ?? [] });
  }
}
