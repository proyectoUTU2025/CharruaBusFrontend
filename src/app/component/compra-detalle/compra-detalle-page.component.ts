import { PasajeDto } from './../../models/pasajes/pasaje-dto.model';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DetalleCompraDto } from '../../models';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CompraService } from '../../services/compra.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { TipoEstadoCompra } from '../../models/tipo-estado-compra';
import { DetallePasajeCompletoDialogComponent } from '../shared/detalle-pasaje-completo-dialog/detalle-pasaje-completo-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MaterialUtilsService } from '../../shared/material-utils.service';
import { NotFoundComponent } from '../not-found/not-found.component';

@Component({
  selector: 'app-compra-detalle-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    RouterModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    NotFoundComponent
  ],
 templateUrl: './compra-detalle-page.component.html',
  styleUrls: ['./compra-detalle-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CompraDetallePageComponent implements OnInit {
  compraId!: number;
  detalle!: DetalleCompraDto;
  isCliente = false;
  isReembolsando = false;
  isOpeningPdf = false;
  isReloading = false;
  loadError: string | null = null;
  
  banner: {
    mostrar: boolean;
    clase: string;
    icono: string;
    texto: string;
  } = { mostrar: false, clase: '', icono: '', texto: '' };
  
  clienteNombre = '';
  vendedorNombre = '';

  displayedColumns = [
    'numeroAsiento',
    'paradaOrigen',
    'paradaDestino',
    'precio',
    'descuento',
    'subtotal',
    'estadoPasaje'
  ];

  constructor(
    private route: ActivatedRoute,
    public router: Router,  
    private compraService: CompraService,
    private authService: AuthService,
    private userService: UserService,
    public dialog: MatDialog,
    private materialUtils: MaterialUtilsService
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const source = params.get('source');
      const status = params.get('status');
      if (source === 'purchase') {
        this.banner.mostrar = true;
        if (status === 'success') {
          this.banner.clase = 'success';
          this.banner.icono = 'check_circle';
          this.banner.texto = '¡Compra Realizada con Éxito!';
        } else if (status === 'cancelled') {
          this.banner.clase = 'cancelled';
          this.banner.icono = 'cancel';
          this.banner.texto = 'La compra fue cancelada.';
        } else if (status === 'failed') {
          this.banner.clase = 'failed';
          this.banner.icono = 'error';
          this.banner.texto = 'Ocurrió un error al procesar la compra.';
        }
      }
    });

    this.isCliente = this.authService.rol === 'CLIENTE';
    this.compraId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarDetalleCompra();
  }

  descargarPdf() {
    this.isOpeningPdf = true;
    this.compraService.descargarPdf(this.compraId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const newWindow = window.open(url, '_blank');
        if (newWindow) {
          newWindow.onload = () => {
            setTimeout(() => {
              window.URL.revokeObjectURL(url);
            }, 1000);
          };
          this.materialUtils.showSuccess(`PDF de la compra ${this.compraId} abierto en nueva ventana`);
        } else {
          // Si se bloqueó el popup, ofrecer descarga alternativa
          const link = document.createElement('a');
          link.href = url;
          link.download = `compra-${this.compraId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          this.materialUtils.showInfo('PDF descargado (ventana emergente bloqueada)');
        }
        this.isOpeningPdf = false;
      },
      error: (error) => {
        console.error('Error al abrir PDF:', error);
        this.materialUtils.showError('Error al abrir el PDF de la compra');
        this.isOpeningPdf = false;
      }
    });
  }
  
  abrirDetallePasaje(pasajeId: number): void {
    const dialogRef = this.dialog.open(DetallePasajeCompletoDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { pasajeId: pasajeId },
      disableClose: true,
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(() => {
      this.cargarDetalleCompra();
    });
  }

  getStatusChipClass(estado: string): string {
    const estadoNormalizado = estado.toLowerCase().replace(/_/g, '-');
    switch (estadoNormalizado) {
      case 'completada':
        return 'badge-completada';
      case 'pendiente':
        return 'badge-pendiente';
      case 'cancelada':
        return 'badge-cancelada';
      case 'reembolsada':
        return 'badge-reembolsada';
      case 'parcialmente-reembolsada':
        return 'badge-parcialmente-reembolsada';
      default:
        return 'badge-pendiente';
    }
  }

  getPasajeStatusChipClass(estado: string): string {
    const estadoNormalizado = estado.toLowerCase().replace(/_/g, '-');
    switch (estadoNormalizado) {
      case 'confirmado':
        return 'badge-completada';
      case 'pendiente':
        return 'badge-pendiente';
      case 'cancelado':
        return 'badge-cancelada';
      case 'devuelto':
        return 'badge-reembolsada';
      case 'parcialmente-reembolsado':
        return 'badge-parcialmente-reembolsada';
      default:
        return 'badge-pendiente';
    }
  }

  formatToTitleCase(text: string): string {
    if (!text) return '';
    return text.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, s => s.toUpperCase());
  }

  // NUEVO: determinar si el PDF puede descargarse según el estado
  puedeDescargarPdf(): boolean {
    if (!this.detalle) return false;
    const estado = this.detalle.estado as TipoEstadoCompra;
    return estado === TipoEstadoCompra.COMPLETADA ||
           estado === TipoEstadoCompra.PARCIALMENTE_REEMBOLSADA;
  }

  /**
   * Reembolsa la compra completa
   */
  reembolsar(): void {
    if (!this.detalle) return;
    
    if (this.detalle.estado === TipoEstadoCompra.REEMBOLSADA) {
      this.materialUtils.showError('Esta compra ya fue reembolsada');
      return;
    }

    if (this.detalle.estado !== TipoEstadoCompra.COMPLETADA && 
        this.detalle.estado !== TipoEstadoCompra.PARCIALMENTE_REEMBOLSADA) {
      this.materialUtils.showError('Solo se pueden reembolsar compras completadas o parcialmente reembolsadas');
      return;
    }

    // Mostrar diálogo de confirmación
    const dialogData: ConfirmDialogData = {
      title: 'Confirmar Reembolso',
      message: `¿Está seguro que desea reembolsar la compra #${this.detalle.id}? Esta acción no se puede deshacer.`,
      confirmText: 'Reembolsar',
      cancelText: 'Cancelar',
      type: 'warning'
    };

    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: dialogData,
      disableClose: true
    });

    confirmDialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.procesarReembolso();
      }
    });
  }

  /**
   * Procesa el reembolso de la compra (llamado después de la confirmación)
   */
  private procesarReembolso(): void {
    if (!this.detalle) return;

    this.isReembolsando = true;

    this.compraService.reembolsarCompra(this.detalle.id).subscribe({
      next: (mensaje) => {
        // Recargar el detalle de la compra para obtener los datos actualizados
        this.cargarDetalleCompra();
        this.isReembolsando = false;
        setTimeout(() => {
          this.materialUtils.showSuccess(mensaje || `Reembolso de la compra ${this.detalle!.id} procesado correctamente`);
        }, 100); // pequeño delay para asegurar que el overlay desaparezca
      },
      error: (error) => {
        console.error('Error al reembolsar compra:', error);
        this.materialUtils.showError('Error al procesar el reembolso de la compra');
        this.isReembolsando = false;
      }
    });
  }

  /**
   * Verifica si una compra se puede reembolsar
   */
  puedeReembolsar(): boolean {
    if (!this.detalle) return false;
    
    return this.detalle.estado !== TipoEstadoCompra.REEMBOLSADA && 
           (this.detalle.estado === TipoEstadoCompra.COMPLETADA ||
            this.detalle.estado === TipoEstadoCompra.PARCIALMENTE_REEMBOLSADA) &&
           !this.isReembolsando &&
           !this.isOpeningPdf;
  }

  /**
   * Recarga el detalle de la compra
   */
  private cargarDetalleCompra(): void {
    this.loadError = null;
    this.isReloading = true;
    this.compraService.getDetalle(this.compraId)
      .subscribe({
        next: d => {
          this.detalle = d;
          // cargar nombre de cliente
          this.userService.getById(d.clienteId)
            .then(u => this.detalle.clienteNombre = `${u.nombre} ${u.apellido}`)
            .catch(() => this.detalle.clienteNombre = 'No disponible');
          // si vino de un vendedor, cargar nombre del vendedor
          if (d.vendedorId) {
            this.userService.getById(d.vendedorId)
              .then(v => this.detalle.vendedorNombre = `${v.nombre} ${v.apellido}`)
              .catch(() => this.detalle.vendedorNombre = 'No disponible');
          }
          this.isReloading = false;
        },
        error: err => {
          console.error('Error al cargar la compra:', err);
          this.loadError = 'No se encontró la compra o ocurrió un error al cargar los datos.';
          this.isReloading = false;
        }
      });
  }

  get subtotalOriginal(): number {
    if (!this.detalle?.pasajes) return 0;
    return this.detalle.pasajes.reduce((sum, p) => sum + (p.precio || 0), 0);
  }

  get descuentosAplicados(): number {
    if (!this.detalle?.pasajes) return 0;
    return this.detalle.pasajes.reduce((sum, p) => sum + (p.descuento || 0), 0);
  }

  get totalPagado(): number {
    if (!this.detalle?.pasajes) return 0;
    return this.detalle.pasajes.reduce((sum, p) => sum + (p.subtotal || 0), 0);
  }

  get totalReembolsado(): number {
    if (!this.detalle?.pasajes) return 0;
    return this.detalle.pasajes.reduce((sum, p) => sum + ((p as any).montoReintegrado || 0), 0);
  }

  get penalizaciones(): number {
    if (!this.detalle?.pasajes) return 0;
    return this.detalle.pasajes
      .filter(p => (p as any).fueReembolsado && (p as any).montoReintegrado !== undefined)
      .reduce((sum, p) => sum + ((p.subtotal || 0) - ((p as any).montoReintegrado || 0)), 0);
  }

  get totalNetoPagado(): number {
    return this.totalPagado - this.totalReembolsado;
  }
}