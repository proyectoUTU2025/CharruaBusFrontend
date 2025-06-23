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
    MatRadioModule 
  ]
})
export class ReasignarOmnibusDialogComponent implements OnInit {
  busesDisponibles: OmnibusDisponibleDto[] = [];
  omnibusSeleccionadoId: number | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { viaje: DetalleViajeDto },
    private busService: BusService,
    private viajeService: ViajeService,
    private dialogRef: MatDialogRef<ReasignarOmnibusDialogComponent>,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const viaje = this.data.viaje;

    const filtro: FiltroDisponibilidadReasOmnibusDto = {
      origenId: viaje.paradas[0].localidadId,
      destinoId: viaje.paradas[viaje.paradas.length - 1].localidadId,
      fechaHoraSalida: viaje.fechaHoraSalida,
      fechaHoraLlegada: viaje.fechaHoraLlegada,
      minAsientos: viaje.cantidadAsientosVendidos + viaje.cantidadAsientosReservados
    };

    this.busService.getDisponiblesParaReasignacion(filtro).then(buses => {
      this.busesDisponibles = buses;
    });
  }
  confirmarReasignacion(): void {
  if (!this.omnibusSeleccionadoId) return;
  const body = { nuevoOmnibusId: this.omnibusSeleccionadoId, confirm: false };

  this.viajeService
    .reasignar(this.data.viaje.id, body)
    .then(() => this.dialogRef.close(true))
    .catch((err: any) => {
      const resp = err.error || {};
      const message =
        typeof resp === 'string'
          ? resp
          : resp.message || 'Error inesperado al reasignar';
      this.dialog
        .open(WarningDialogComponent, { data: { message } })
        .afterClosed()
        .subscribe((confirmed) => {
          if (!confirmed) return;
          this.viajeService
            .reasignar(this.data.viaje.id, { ...body, confirm: true })
            .then(() => this.dialogRef.close(true))
            .catch((err2: any) => {
              const resp2 = err2.error || {};
              const message2 =
                typeof resp2 === 'string'
                  ? resp2
                  : resp2.message || 'Error al confirmar reasignación';
              this.dialog.open(WarningDialogComponent, {
                data: { message: message2 },
              });
            });
        });
    });
  }
  cancelar(): void {
    this.dialogRef.close();
  }
}
