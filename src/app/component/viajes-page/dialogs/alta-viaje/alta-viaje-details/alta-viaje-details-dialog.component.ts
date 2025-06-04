import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { firstValueFrom } from 'rxjs';
import { BusService } from '../../../../../services/bus.service';
import { LocalidadService } from '../../../../../services/localidades.service';
import { LocalidadDto } from '../../../../../models/localidades/localidades-dto.model';
import { FiltroDisponibilidadOmnibusDto, OmnibusDisponibleDto } from '../../../../../models/buses';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-alta-viaje-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
    MatListModule,
    MatStepperModule,
    MatIconModule
  ],
  templateUrl: './alta-viaje-details-dialog.component.html',
  styleUrls: ['./alta-viaje-details-dialog.component.scss']
})
export class AltaViajeDetailsDialogComponent implements OnInit {
  step = 0;
  localidades: LocalidadDto[] = [];
  buses: OmnibusDisponibleDto[] = [];

  origenId: number = 0;
  destinoId: number = 0;
  fechaSalida: Date | null = null;
  fechaLlegada: Date | null = null;
  precio: number = 0;

  paradaIntermediaId: number | null = null;
  paradasIntermedias: number[] = [];

  busSeleccionado: OmnibusDisponibleDto | null = null;

  constructor(
    private dialogRef: MatDialogRef<AltaViajeDetailsDialogComponent>,
    private busService: BusService,
    private localidadesService: LocalidadService
  ) {}

  async ngOnInit(): Promise<void> {
    const page = await firstValueFrom(this.localidadesService.getAll({}, 0, 1000));
    this.localidades = page.content;
  }

  siguiente(): void {
    this.step++;
    if (this.step === 2) {
      this.cargarBuses();
    }
  }

  anterior(): void {
    this.step--;
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  agregarParadaIntermedia(): void {
    if (this.paradaIntermediaId && !this.paradasIntermedias.includes(this.paradaIntermediaId) && this.paradaIntermediaId !== this.origenId && this.paradaIntermediaId !== this.destinoId) {
      this.paradasIntermedias.push(this.paradaIntermediaId);
    }
    this.paradaIntermediaId = null;
  }

  eliminarParada(index: number): void {
    this.paradasIntermedias.splice(index, 1);
  }

  confirmar(): void {
    if (!this.busSeleccionado) return;

    const paradas = [
      { localidadId: this.origenId, orden: 1 },
      ...this.paradasIntermedias.map((id, idx) => ({ localidadId: id, orden: idx + 2 })),
      { localidadId: this.destinoId, orden: this.paradasIntermedias.length + 2 }
    ];

    const alta = {
      origenId: this.origenId,
      destinoId: this.destinoId,
      fechaHoraSalida: this.formatFecha(this.fechaSalida),
      fechaHoraLlegada: this.formatFecha(this.fechaLlegada),
      precio: this.precio,
      omnibusId: this.busSeleccionado.id,
      paradas,
      confirm: true
    };

    this.dialogRef.close(alta);
  }

  cargarBuses(): void {
    if (!this.origenId || !this.destinoId || !this.fechaSalida || !this.fechaLlegada || this.precio <= 0) return;

    const filtro: FiltroDisponibilidadOmnibusDto = {
      origenId: this.origenId,
      destinoId: this.destinoId,
      fechaHoraSalida: this.formatFecha(this.fechaSalida),
      fechaHoraLlegada: this.formatFecha(this.fechaLlegada)
    };

    this.busService.getDisponibles(filtro).then(buses => {
      this.buses = buses;
    }).catch(() => {
      this.buses = [];
    });
  }

  localidadNombre(id: number): string {
    return this.localidades.find(l => l.id === id)?.nombre ?? 'Desconocido';
  }

  deberiaDeshabilitarSiguiente(): boolean {
    if (this.step === 0) return !this.origenId || !this.destinoId || !this.fechaSalida || !this.fechaLlegada || this.precio <= 0;
    if (this.step === 2) return !this.busSeleccionado;
    return false;
  }

  private formatFecha(fecha: Date | null): string {
    if (!fecha) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    const y = fecha.getFullYear();
    const m = pad(fecha.getMonth() + 1);
    const d = pad(fecha.getDate());
    const h = pad(fecha.getHours());
    const min = pad(fecha.getMinutes());
    const s = pad(fecha.getSeconds());
    return `${y}-${m}-${d}T${h}:${min}:${s}`;
  }

  busSeleccionadoArray: OmnibusDisponibleDto[] = [];

  onBusSeleccionadoChange(): void {
    this.busSeleccionado = this.busSeleccionadoArray[0] ?? null;
  }

}
