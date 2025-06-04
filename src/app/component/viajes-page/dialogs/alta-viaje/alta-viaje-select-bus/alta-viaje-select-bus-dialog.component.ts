import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { OmnibusDisponibleDto, FiltroDisponibilidadOmnibusDto } from '../../../../../models/buses';
import { BusService } from '../../../../../services/bus.service';

@Component({
  selector: 'app-alta-viaje-select-bus-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatListModule
  ],
  templateUrl: './alta-viaje-select-bus-dialog.component.html',
  styleUrls: ['./alta-viaje-select-bus-dialog.component.scss']
})
export class AltaViajeSelectBusDialogComponent implements OnInit {
  buses: OmnibusDisponibleDto[] = [];

  constructor(
    private busService: BusService,
    private dialogRef: MatDialogRef<AltaViajeSelectBusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      origenId: number;
      destinoId: number;
      fechaHoraSalida: string;
      fechaHoraLlegada: string;
    }
  ) {}

  ngOnInit(): void {
    const filtro: FiltroDisponibilidadOmnibusDto = {
      origenId: this.data.origenId,
      destinoId: this.data.destinoId,
      fechaHoraSalida: this.data.fechaHoraSalida,
      fechaHoraLlegada: this.data.fechaHoraLlegada
    };

    this.busService.getDisponibles(filtro).then(buses => {
      this.buses = buses;
    });
  }

  seleccionar(bus: OmnibusDisponibleDto) {
    this.dialogRef.close(bus);
  }

  cancelar() {
    this.dialogRef.close();
  }
}
