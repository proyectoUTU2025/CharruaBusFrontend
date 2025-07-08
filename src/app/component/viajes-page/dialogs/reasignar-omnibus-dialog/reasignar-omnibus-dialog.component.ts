import { FiltroDisponibilidadReasOmnibusDto } from './../../../../models/buses/bus.model.dto';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DetalleViajeDto } from '../../../../models/viajes';
import { BusService } from '../../../../services/bus.service';
import { ViajeService } from '../../../../services/viaje.service';
import { WarningDialogComponent } from '../warning-dialog/warning-dialog/warning-dialog.component';
import { OmnibusDisponibleDto } from '../../../../models';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MaterialUtilsService } from '../../../../shared/material-utils.service';

@Component({
  selector: 'app-reasignar-omnibus-dialog',
  standalone: true,
  templateUrl: './reasignar-omnibus-dialog.component.html',
  styleUrls: ['./reasignar-omnibus-dialog.component.scss'],
  imports: [ 
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    FormsModule,
    WarningDialogComponent,
    MatRadioModule,
    MatProgressSpinnerModule
  ]
})
export class ReasignarOmnibusDialogComponent implements OnInit {
  busesDisponibles: OmnibusDisponibleDto[] = [];
  omnibusSeleccionadoId: number | null = null;
  isLoadingBuses = false;
  isLoadingConfirm = false;
  errorMensaje = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { viaje: DetalleViajeDto },
    private busService: BusService,
    private viajeService: ViajeService,
    private dialogRef: MatDialogRef<ReasignarOmnibusDialogComponent>,
    private dialog: MatDialog,
    private materialUtils: MaterialUtilsService,
  ) {}

  ngOnInit(): void {
    this.cargarBusesDisponibles();
  }

  private cargarBusesDisponibles(): void {
    this.isLoadingBuses = true;
    const viaje = this.data.viaje;

    const filtro: FiltroDisponibilidadReasOmnibusDto = {
      origenId: viaje.paradas[0].localidadId,
      destinoId: viaje.paradas[viaje.paradas.length - 1].localidadId,
      fechaHoraSalida: viaje.fechaHoraSalida,
      fechaHoraLlegada: viaje.fechaHoraLlegada,
      minAsientos: viaje.cantidadAsientosVendidos + viaje.cantidadAsientosReservados
    };

    this.busService.getDisponiblesParaReasignacion(filtro)
      .then(buses => {
        this.busesDisponibles = buses;
      })
      .catch(error => {
        console.error('Error al cargar buses disponibles:', error);
        this.busesDisponibles = [];
      })
      .finally(() => {
        this.isLoadingBuses = false;
      });
  }

  seleccionarBus(bus: OmnibusDisponibleDto): void {
    this.omnibusSeleccionadoId = bus.id;
  }

  getBusSeleccionado(): OmnibusDisponibleDto | undefined {
    return this.busesDisponibles.find(bus => bus.id === this.omnibusSeleccionadoId);
  }

  get isViajeExpirado(): boolean {
    const fechaHoraSalida = new Date(this.data.viaje.fechaHoraSalida);
    const ahora = new Date();
    return fechaHoraSalida < ahora;
  }

  get puedeReasignar(): boolean {
    return !this.isViajeExpirado && !!this.omnibusSeleccionadoId;
  }

  confirmarReasignacion(): void {
    if (!this.puedeReasignar || !this.omnibusSeleccionadoId) return;
    
    this.isLoadingConfirm = true;
    this.errorMensaje = '';
    const body = { nuevoOmnibusId: this.omnibusSeleccionadoId, confirm: false };

    this.viajeService
      .reasignar(this.data.viaje.id, body)
      .subscribe({
        next: () => {
          this.isLoadingConfirm = false;
          this.materialUtils.showSuccess('Ómnibus reasignado exitosamente.');
          this.dialogRef.close(true);
        },
        error: (err: any) => {
          this.isLoadingConfirm = false;
          
          if (err.status === 409 && err.error?.message) {
            const resp = err.error || {};
            const message = typeof resp === 'string'
                ? resp
                : resp.message || 'Error inesperado al reasignar';
            
            this.dialog
              .open(WarningDialogComponent, { data: { message }, disableClose: true })
              .afterClosed()
              .subscribe((confirmed) => {
                if (!confirmed) return;
                
                this.isLoadingConfirm = true;
                this.errorMensaje = '';
                this.viajeService
                  .reasignar(this.data.viaje.id, { ...body, confirm: true })
                  .subscribe({
                    next: () => {
                      this.isLoadingConfirm = false;
                      this.materialUtils.showSuccess('Ómnibus reasignado exitosamente.');
                      this.dialogRef.close(true);
                    },
                    error: (err2: any) => {
                      this.isLoadingConfirm = false;
                      const resp2 = err2.error || {};
                      this.errorMensaje = typeof resp2 === 'string'
                          ? resp2
                          : resp2.message || 'Error al confirmar reasignación';
                    }
                  });
              });
          } else {
            const resp = err.error || {};
            this.errorMensaje = typeof resp === 'string'
                ? resp
                : resp.message || 'Error inesperado al reasignar';
          }
        }
      });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
