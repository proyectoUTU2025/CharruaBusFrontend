import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompraService } from '../../services/compra.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CompraResponseDto } from '../../models/compra';

@Component({
  selector: 'app-stripe-redirect',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatProgressBarModule
  ],
  templateUrl: './stripe-redirect.component.html',
  styleUrls: ['./stripe-redirect.component.scss']
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
    const sessionId = new URLSearchParams(window.location.search).get('session_id');

    if (!sessionId) {
      this.mensaje = '❌ Error: sesión de pago no encontrada.';
      this.cargando = false;
      this.iniciarRedireccion();
      return;
    }

    if (url.includes('/compras/exito')) {
      this.compraService.confirmarCompra(sessionId).subscribe(
        (_: any) => {
          this.mensaje = '✅ Compra confirmada con éxito!';
          this.cargando = false;
          setTimeout(() => this.router.navigate(['/compras', (_ as CompraResponseDto).compraId]), 2000);
        },
        () => {
          this.mensaje = '⚠️ Error al confirmar la compra.';
          this.cargando = false;
          this.iniciarRedireccion();
        }
      );
    } else if (url.includes('/compras/cancelada')) {
      this.compraService.cancelarCompra(sessionId).subscribe(
        () => {
          this.mensaje = '❌ Compra cancelada.';
          this.cargando = false;
          this.iniciarRedireccion();
        },
        () => {
          this.mensaje = '⚠️ Error al cancelar la compra.';
          this.cargando = false;
          this.iniciarRedireccion();
        }
      );
    } else {
      this.mensaje = '🚫 Ruta de redirección no válida.';
      this.cargando = false;
      this.iniciarRedireccion();
    }
  }

  private iniciarRedireccion(): void {
    setTimeout(() => {
      this.router.navigate(['/comprar']);
    }, 3000);
  }
}
