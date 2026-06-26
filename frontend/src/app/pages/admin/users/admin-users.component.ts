import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  template: `
    <h1>Usuarios</h1>
    <div class="card">
      <p class="text-muted">Gestión de usuarios vía API <code>/api/users</code> (mismo flujo que CoreX).</p>
      <p>Próxima iteración: formulario CRUD en Angular.</p>
    </div>
  `,
})
export class AdminUsersComponent {}
