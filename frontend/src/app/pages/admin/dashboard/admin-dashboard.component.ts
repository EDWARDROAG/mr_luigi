import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../../core/services/product.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Dashboard</h1>
    @if (stats) {
      <div class="grid">
        <div class="card"><h3>Ventas hoy</h3><p class="text-accent">{{ stats['ventas_hoy'] || 0 }}</p></div>
        <div class="card"><h3>Productos</h3><p class="text-accent">{{ stats['total_productos'] || 0 }}</p></div>
        <div class="card"><h3>Disponibles</h3><p class="text-accent">{{ stats['disponibles'] || 0 }}</p></div>
      </div>
    } @else {
      <p class="text-muted">Conecta el backend para ver métricas.</p>
    }
  `,
  styles: [`.grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:1rem; }`],
})
export class AdminDashboardComponent implements OnInit {
  stats: Record<string, number> | null = null;
  private readonly reports = inject(ReportService);

  ngOnInit(): void {
    this.reports.dashboard().subscribe({
      next: (res: unknown) => {
        const data = res as { data?: Record<string, number> };
        this.stats = data.data ?? null;
      },
      error: () => { this.stats = null; },
    });
  }
}
