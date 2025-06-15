import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompraService } from '../../services/compra.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-stripe-redirect',
  templateUrl: './stripe-redirect.component.html',
  styleUrls: ['./stripe-redirect.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatProgressBarModule
  ]
})
export class StripeRedirectComponent implements OnInit {
  mensaje = '';
  cargando = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private compraService: CompraService
  ) {}

  ngOnInit(): void {
    const url = this.router.url;
    const sessionId = this.getSessionIdFromUrl();

    if (!sessionId) {
      this.mensaje = 'Error: sesión de pago no encontrada.';
      this.cargando = false;
      this.iniciarRedireccion();
      return;
    }

    if (url.includes('/compras/exito')) {
      this.compraService.confirmarCompra(sessionId).subscribe({
        next: () => {
          this.mensaje = 'Compra confirmada con éxito ✅';
          this.cargando = false;
          this.iniciarRedireccion();
        },
        error: () => {
          this.mensaje = 'Error al confirmar la compra.';
          this.cargando = false;
          this.iniciarRedireccion();
        }
      });
    } else if (url.includes('/compras/cancelada')) {
      this.compraService.cancelarCompra(sessionId).subscribe({
        next: () => {
          this.mensaje = 'Compra cancelada ❌';
          this.cargando = false;
          this.iniciarRedireccion();
        },
        error: () => {
          this.mensaje = 'Error al cancelar la compra.';
          this.cargando = false;
          this.iniciarRedireccion();
        }
      });
    } else {
      this.mensaje = 'Ruta de redirección no válida.';
      this.cargando = false;
      this.iniciarRedireccion();
    }
  }

  private iniciarRedireccion(): void {
    setTimeout(() => {
      this.router.navigate(['/comprar']);
    }, 3000);
  }

  private getSessionIdFromUrl(): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get('session_id');
  }
}
