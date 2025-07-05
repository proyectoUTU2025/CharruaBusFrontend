import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompraService } from '../../services/compra.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { CompraResponseDto } from '../../models/compra';

@Component({
  selector: 'app-stripe-redirect',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatIconModule
  ],
  templateUrl: './stripe-redirect.component.html',
  styleUrls: ['./stripe-redirect.component.scss']
})
export class StripeRedirectComponent implements OnInit {
  cargando = true;
  mensaje = '';
  error: boolean = false;
  compraId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private compraService: CompraService,
    private router: Router
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      const sessionId = this.route.snapshot.queryParamMap.get('session_id');
      const estado = this.route.snapshot.paramMap.get('estado');
      debugger;
      if (sessionId && estado === 'exito') {
        this.compraService.confirmarCompra(sessionId).subscribe({
          next: (response) => {
            this.cargando = false;
            this.mensaje = '¡Compra confirmada con éxito!';
            this.compraId = response.compraId;
            this.redirigir(true);
          },
          error: (err) => {
            this.cargando = false;
            this.error = true;
            this.mensaje = 'Error al confirmar la compra.';
            console.error(err);
            this.redirigir(false);
          },
        });
      } else if (sessionId && estado === 'cancelada') {
        this.compraService.cancelarCompra(sessionId).subscribe({
          next: (response) => {
            this.cargando = false;
            this.error = true;
            this.mensaje = 'La compra ha sido cancelada.';
            this.compraId = response.compraId;
            this.redirigir(false, true);
          },
          error: (err) => {
            this.cargando = false;
            this.error = true;
            this.mensaje = 'Error al cancelar la compra.';
            this.redirigir(false);
          },
        });
      } else {
        this.cargando = false;
        this.error = true;
        this.mensaje = 'Parámetros inválidos para la redirección.';
        this.router.navigate(['/home']);
      }
    }, 5000);
  }

  private redirigir(exito: boolean, cancelado: boolean = false): void {
    setTimeout(() => {
      if (this.compraId) {
        let queryParams = { 
          source: 'purchase',
          status: exito ? 'success' : (cancelado ? 'cancelled' : 'failed')
        };
        this.router.navigate(['/compra', this.compraId], { queryParams });
      } else {
        // Si no hay ID de compra, redirigir a una página genérica
        this.router.navigate(['/pasajes-history']); 
      }
    }, 1000);
  }
}
