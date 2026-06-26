import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  template: `
    <h1 class="glow">Contacto</h1>
    <div class="card" style="max-width:480px">
      <p>Escríbenos por WhatsApp para cotizaciones, reparaciones y pedidos.</p>
      <a class="btn btn-accent" [href]="whatsappLink" target="_blank" rel="noopener">Abrir WhatsApp</a>
    </div>
  `,
})
export class ContactComponent {
  readonly whatsappLink = `https://wa.me/${environment.whatsappPhone}`;
}
