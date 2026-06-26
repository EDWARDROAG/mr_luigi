import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Product, Sale, CashierClosure } from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = inject(ApiService);

  list(params?: Record<string, string | number | boolean>) {
    return this.api.get<{ success: boolean; data: Product[] }>('/products', params);
  }

  getById(id: number) {
    return this.api.get<{ success: boolean; data: Product }>(`/products/${id}`);
  }

  create(product: Partial<Product>) {
    return this.api.post('/products', product);
  }

  update(id: number, product: Partial<Product>) {
    return this.api.put(`/products/${id}`, product);
  }

  remove(id: number) {
    return this.api.delete(`/products/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class SaleService {
  private readonly api = inject(ApiService);

  list(params?: Record<string, string | number | boolean>) {
    return this.api.get<{ success: boolean; data: Sale[] }>('/sales', params);
  }

  create(payload: {
    items: Array<{ producto_id: number; cantidad: number; precio_unitario: number }>;
    metodo_pago: string;
    cliente_nombre?: string;
    cliente_telefono?: string;
  }) {
    return this.api.post('/sales', payload);
  }
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly api = inject(ApiService);

  dashboard() {
    return this.api.get('/reports/dashboard');
  }

  cashierClosure(fecha: string) {
    return this.api.get<{ success: boolean; data: CashierClosure }>('/reports/cashier-closure', { fecha });
  }

  inventory() {
    return this.api.get('/reports/inventory');
  }
}
