import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../core/services/product.service';
import { CashierClosure } from '../../../core/models/app.models';

@Component({
  selector: 'app-admin-cashier-closure',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Cierre de caja</h1>
    <div style="margin-bottom:1rem">
      <input class="input" type="date" [(ngModel)]="fecha" style="max-width:200px;display:inline-block" />
      <button class="btn btn-primary" (click)="load()" style="margin-left:0.5rem">Consultar</button>
    </div>
    @if (data) {
      <div class="grid">
        <div class="card"><h3>Total ventas</h3><p class="text-accent">{{ data.resumen.total_ventas | currency:'COP':'symbol-narrow':'1.0-0' }}</p></div>
        <div class="card"><h3>Efectivo</h3><p>{{ data.resumen.total_efectivo | currency:'COP':'symbol-narrow':'1.0-0' }}</p></div>
        <div class="card"><h3>Transferencia</h3><p>{{ data.resumen.total_transferencia | currency:'COP':'symbol-narrow':'1.0-0' }}</p></div>
        <div class="card"><h3>Cantidad</h3><p>{{ data.resumen.cantidad_ventas }}</p></div>
      </div>
      <h2 style="margin-top:1.5rem">Por vendedor</h2>
      <table class="table card">
        <thead><tr><th>Vendedor</th><th>Total</th><th>Efectivo</th><th>Transferencia</th><th>Ventas</th></tr></thead>
        <tbody>
          @for (v of data.por_vendedor; track v.vendedor) {
            <tr>
              <td>{{ v.vendedor }}</td>
              <td>{{ v.total | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
              <td>{{ v.efectivo | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
              <td>{{ v.transferencia | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
              <td>{{ v.cantidad }}</td>
            </tr>
          }
        </tbody>
      </table>
    }
  `,
  styles: [`.grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:1rem; }`],
})
export class AdminCashierClosureComponent implements OnInit {
  fecha = new Date().toISOString().slice(0, 10);
  data: CashierClosure | null = null;
  private readonly reports = inject(ReportService);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.reports.cashierClosure(this.fecha).subscribe({
      next: (r) => this.data = r.data ?? null,
      error: () => this.data = null,
    });
  }
}
