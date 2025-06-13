import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompraService } from '../../services/compra.service';

@Component({
  standalone: true,
  selector: 'app-stripe-redirect',
  template: `
    <div class="loading">
      Procesando compra...<br>
      <span class="dots">●●●</span>
    </div>
  `,
  styles: [`
    .loading {
      height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      font-size: 1.2rem;
    }
    .dots {
      animation: blink 1.4s infinite;
    }
    @keyframes blink {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }
  `]
})
export class StripeRedirectComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private compraService: CompraService
  ) {}

  ngOnInit(): void {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    const isSuccess = this.route.snapshot.queryParamMap.get('success') === 'true';
    const isCancel = this.route.snapshot.queryParamMap.get('cancel') === 'true';

    if (!sessionId) {
      this.router.navigate(['/compra'], { queryParams: { estado: 'error' } });
      return;
    }

    const request$ = isSuccess
      ? this.compraService.confirmarCompra(sessionId)
      : this.compraService.cancelarCompra(sessionId);

    request$.subscribe({
      next: () => {
        const estado = isSuccess ? 'exito' : 'cancelado';
        this.router.navigate(['/compra'], { queryParams: { estado } });
      },
      error: () => {
        this.router.navigate(['/compra'], { queryParams: { estado: 'error' } });
      }
    });
  }
}
