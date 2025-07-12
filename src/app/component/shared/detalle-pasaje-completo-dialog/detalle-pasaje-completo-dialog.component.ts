import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PasajeDto } from '../../../models/pasajes/pasaje-dto.model';
import { PasajeService } from '../../../services/pasaje.service';
import { MaterialUtilsService } from '../../../shared/material-utils.service';
import { TipoEstadoPasaje } from '../../../models/pasajes/tipo-estado-pasaje.enum';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-detalle-pasaje-completo-dialog',
  standalone: true,
  templateUrl: './detalle-pasaje-completo-dialog.component.html',
  styleUrl: './detalle-pasaje-completo-dialog.component.css',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ]
})
export class DetallePasajeCompletoDialogComponent {
  pasaje: PasajeDto | null = null;
  isLoading = false;
  isOpeningPdf = false;
  isReembolsando = false;
  isCliente = false;
  mostrarLinkCompra = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { pasajeId: number, mostrarLinkCompra?: boolean },
    private dialogRef: MatDialogRef<DetallePasajeCompletoDialogComponent>,
    private pasajeService: PasajeService,
    private materialUtils: MaterialUtilsService,
    private dialog: MatDialog,
    private authService: AuthService
  ) {
    this.isCliente = this.authService.rol === 'CLIENTE';
    if (this.data.mostrarLinkCompra === false) {
      this.mostrarLinkCompra = false;
    }
    this.cargarDetallePasaje();
  }

  cargarDetallePasaje(): void {
    this.isLoading = true;
    
    this.pasajeService.getDetallePasaje(this.data.pasajeId).subscribe({
      next: (pasaje) => {
        this.pasaje = pasaje;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar detalle del pasaje:', error);
        this.materialUtils.showError('Error al cargar el detalle del pasaje');
        this.isLoading = false;
        this.dialogRef.close();
      }
    });
  }

  verCompra(): void {
    if (this.pasaje?.compraId) {
      this.dialogRef.close({
        action: 'VER_COMPRA',
        compraId: this.pasaje.compraId
      });
    }
  }

  abrirPdf(): void {
    if (!this.pasaje) return;
    
    if (this.pasaje.estadoPasaje !== TipoEstadoPasaje.CONFIRMADO) {
      this.materialUtils.showError('Solo se puede ver el PDF de pasajes confirmados');
      return;
    }
    
    this.isOpeningPdf = true;
    
    this.pasajeService.descargarPdf(this.pasaje.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const newWindow = window.open(url, '_blank');
        
        if (newWindow) {
          newWindow.onload = () => {
            setTimeout(() => {
              window.URL.revokeObjectURL(url);
            }, 1000);
          };
          this.materialUtils.showSuccess(`PDF del pasaje ${this.pasaje!.id} abierto en nueva ventana`);
        } else {
          const link = document.createElement('a');
          link.href = url;
          link.download = `pasaje-${this.pasaje!.id}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          this.materialUtils.showInfo('PDF descargado');
        }
        
        this.isOpeningPdf = false;
      },
      error: (error) => {
        console.error('Error al abrir PDF:', error);
        this.materialUtils.showError('Error al abrir el PDF del pasaje');
        this.isOpeningPdf = false;
      }
    });
  }

  reembolsar(): void {
    if (!this.pasaje) return;
    
    if (this.pasaje.fueReembolsado) {
      this.materialUtils.showError('Este pasaje ya fue reembolsado');
      return;
    }

    if (this.pasaje.estadoPasaje !== TipoEstadoPasaje.CONFIRMADO) {
      this.materialUtils.showError('Solo se pueden reembolsar pasajes confirmados');
      return;
    }

    const dialogData: ConfirmDialogData = {
      title: 'Confirmar Reembolso',
      message: `¿Está seguro que desea reembolsar el pasaje #${this.pasaje.id}? Esta acción no se puede deshacer.`,
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

  private procesarReembolso(): void {
    if (!this.pasaje) return;

    this.isReembolsando = true;

    this.pasajeService.reembolsarPasaje(this.pasaje.id).subscribe({
      next: (mensaje) => {
        this.materialUtils.showSuccess(mensaje || `Reembolso del pasaje ${this.pasaje!.id} procesado correctamente`);
        
        this.cargarDetallePasaje();
        this.isReembolsando = false;
      },
      error: (error) => {
        console.error('Error al reembolsar pasaje:', error);
        const errorMessage = error.error?.message || 'Error al procesar el reembolso del pasaje';
        this.materialUtils.showError(errorMessage);
        this.isReembolsando = false;
      }
    });
  }

  puedeReembolsar(): boolean {
    if (!this.pasaje || this.isCliente) return false;
    
    return !this.pasaje.fueReembolsado && 
           this.pasaje.estadoPasaje === TipoEstadoPasaje.CONFIRMADO &&
           !this.isReembolsando &&
           !this.isOpeningPdf;
  }

  puedeVerPdf(): boolean {
    if (!this.pasaje) return false;
    
    return this.pasaje.estadoPasaje === TipoEstadoPasaje.CONFIRMADO &&
           !this.isOpeningPdf &&
           !this.isReembolsando;
  }

  private formatToTitleCase(str: string): string {
    if (!str) return '';
    return str.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, s => s.toUpperCase());
  }

  getEstadoText(estado: TipoEstadoPasaje): string {
    const estadoStr = estado.toString();
    return this.formatToTitleCase(estadoStr);
  }

  getEstadoColors(estado: TipoEstadoPasaje): { [key: string]: string } {
    const styles = {
      [TipoEstadoPasaje.CONFIRMADO]: { 'background-color': '#e6f4ea', color: '#2e7d32', 'border-color': '#2e7d32' },
      [TipoEstadoPasaje.PENDIENTE]: { 'background-color': '#fff3e0', color: '#ef6c00', 'border-color': '#ef6c00' },
      [TipoEstadoPasaje.CANCELADO]: { 'background-color': '#fdecea', color: '#c62828', 'border-color': '#c62828' },
      [TipoEstadoPasaje.DEVUELTO]: { 'background-color': '#e3f2fd', color: '#1976d2', 'border-color': '#1976d2' }
    };
    return styles[estado] || { 'background-color': '#fff3e0', color: '#ef6c00', 'border-color': '#ef6c00' };
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
