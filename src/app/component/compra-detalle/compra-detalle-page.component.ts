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
    MatDividerModule
  ],
 templateUrl: './compra-detalle-page.component.html',
  styleUrls: ['./compra-detalle-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CompraDetallePageComponent implements OnInit {
  compraId!: number;
  detalle!: DetalleCompraDto;
  isCliente = false;
  
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
    private router: Router,  
    private compraService: CompraService,
    private authService: AuthService,
    private userService: UserService,
    public dialog: MatDialog
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
    this.compraService.getDetalle(this.compraId)
      .subscribe(d => {
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
      });
  }

  descargarPdf() {
    this.compraService.descargarPdf(this.compraId)
      .subscribe(blob => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      });
  }
  
  abrirDetallePasaje(pasajeId: number): void {
    this.dialog.open(DetallePasajeCompletoDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { pasajeId: pasajeId },
      disableClose: true,
      autoFocus: false,
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
}