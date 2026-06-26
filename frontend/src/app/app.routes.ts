import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { AdminLayoutComponent, CajeroLayoutComponent } from './layouts/panel-layout/panel-layout.component';
import { HomeComponent } from './pages/public/home/home.component';
import { CatalogComponent } from './pages/public/catalog/catalog.component';
import { ContactComponent } from './pages/public/contact/contact.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { AdminDashboardComponent } from './pages/admin/dashboard/admin-dashboard.component';
import { AdminProductsComponent } from './pages/admin/products/admin-products.component';
import { AdminSalesComponent } from './pages/admin/sales/admin-sales.component';
import { AdminCashierClosureComponent } from './pages/admin/cashier-closure/admin-cashier-closure.component';
import { AdminUsersComponent } from './pages/admin/users/admin-users.component';
import { CajeroPosComponent } from './pages/cajero/pos/cajero-pos.component';
import { CajeroHistoryComponent } from './pages/cajero/history/cajero-history.component';
import { authGuard, guestGuard, roleGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'catalogo', component: CatalogComponent },
      { path: 'contacto', component: ContactComponent },
    ],
  },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard(['admin'])],
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'productos', component: AdminProductsComponent },
      { path: 'ventas', component: AdminSalesComponent },
      { path: 'cierre-caja', component: AdminCashierClosureComponent },
      { path: 'usuarios', component: AdminUsersComponent },
    ],
  },
  {
    path: 'cajero',
    component: CajeroLayoutComponent,
    canActivate: [authGuard, roleGuard(['admin', 'cajero'])],
    children: [
      { path: '', component: CajeroPosComponent },
      { path: 'historial', component: CajeroHistoryComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
