export type UserRole = 'admin' | 'cajero';

export interface User {
  id: number;
  nombre: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface Product {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  condicion?: string;
  categoria_id?: number;
  imagen_url?: string;
  destacado?: boolean;
  stock: number;
}

export interface Sale {
  id: number;
  vendedor_id?: number;
  cliente_nombre?: string;
  cliente_telefono?: string;
  metodo_pago: string;
  total: number;
  fecha_venta: string;
  estado: string;
}

export interface CashierClosure {
  fecha: string;
  resumen: {
    total_ventas: number;
    total_efectivo: number;
    total_transferencia: number;
    cantidad_ventas: number;
  };
  por_vendedor: Array<{
    vendedor: string;
    total: number;
    efectivo: number;
    transferencia: number;
    cantidad: number;
  }>;
  ventas: Sale[];
}
