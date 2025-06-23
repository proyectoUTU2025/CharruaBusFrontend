import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { BusService } from '../../../../../services/bus.service';
import { LocalidadService } from '../../../../../services/localidades.service';
import { ViajeService } from '../../../../../services/viaje.service';
import { LocalidadDto } from '../../../../../models/localidades/localidades-dto.model';
import { FiltroDisponibilidadOmnibusDto, OmnibusDisponibleDto } from '../../../../../models/buses';
import { WarningDialogComponent } from '../../warning-dialog/warning-dialog/warning-dialog.component';
import { LocalidadNombreDepartamentoDto } from '../../../../../models/localidades/localidad-nombre-departamento-dto.model';

@Component({
  standalone: true,
  selector: 'app-alta-viaje-details-dialog',
  templateUrl: './alta-viaje-details-dialog.component.html',
  styleUrls: ['./alta-viaje-details-dialog.component.scss'],
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
    MatIconModule,
    WarningDialogComponent
  ]
})
export class AltaViajeDetailsDialogComponent implements OnInit {
  step = 0;
  completedSteps: boolean[] = [false, false, false];
  localidades: LocalidadNombreDepartamentoDto[] = [];
  buses: OmnibusDisponibleDto[] = [];
  origenId = 0;
  destinoId = 0;
  fechaSalida: Date | null = null;
  fechaLlegada: Date | null = null;
  horaSalida = '';
  horaLlegada = '';
  precio = 0;
  paradaIntermediaId: number | null = null;
  paradasIntermedias: number[] = [];
  busSeleccionado: OmnibusDisponibleDto | null = null;
  busSeleccionadoArray: OmnibusDisponibleDto[] = [];

  constructor(
    private dialogRef: MatDialogRef<AltaViajeDetailsDialogComponent>,
    private busService: BusService,
    private localidadesService: LocalidadService,
    private viajeService: ViajeService,
    private dialog: MatDialog
  ) { }

  async ngOnInit(): Promise<void> {
    this.localidades = await firstValueFrom(this.localidadesService.getAllFlat());
  }

  siguiente(): void {
    this.completedSteps[this.step] = true;
    this.step++;
    if (this.step === 2) this.cargarBuses();
  }

  anterior(): void {
    this.step--;
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  agregarParadaIntermedia(): void {
    if (
      this.paradaIntermediaId != null &&
      !this.paradasIntermedias.includes(this.paradaIntermediaId) &&
      this.paradaIntermediaId !== this.origenId &&
      this.paradaIntermediaId !== this.destinoId
    ) {
      this.paradasIntermedias.push(this.paradaIntermediaId);
    }
    this.paradaIntermediaId = null;
  }

  eliminarParada(index: number): void {
    this.paradasIntermedias.splice(index, 1);
  }

  confirmar(): void {
    if (!this.busSeleccionado || !this.fechaSalida || !this.fechaLlegada) return;

    const total = 2 + this.paradasIntermedias.length;
    const salida = new Date(this.formatFecha(this.fechaSalida, this.horaSalida));
    const llegada = new Date(this.formatFecha(this.fechaLlegada, this.horaLlegada));
    const intervalo = (llegada.getTime() - salida.getTime()) / (total - 1);

    const localidadesIds = [this.origenId, ...this.paradasIntermedias, this.destinoId];
    const paradas = localidadesIds.map((id, idx) => ({
      localidadId: id,
      orden: idx + 1,
      fechaHoraLlegada: new Date(salida.getTime() + idx * intervalo).toISOString()
    }));

    const alta = {
      origenId: this.origenId,
      destinoId: this.destinoId,
      fechaHoraSalida: this.formatFecha(this.fechaSalida, this.horaSalida),
      fechaHoraLlegada: this.formatFecha(this.fechaLlegada, this.horaLlegada),
      precio: this.precio,
      omnibusId: this.busSeleccionado.id,
      paradas,
      confirm: false
    };

    this.viajeService.altaViaje(alta)
      .then(() => this.dialogRef.close(alta))
      .catch(mensaje => {
        this.dialog.open(WarningDialogComponent, { data: { message: mensaje } })
          .afterClosed().subscribe((confirmado: boolean) => {
            if (!confirmado) return;
            this.viajeService.altaViaje({ ...alta, confirm: true })
              .then(() => this.dialogRef.close(alta))
              .catch(err => {
                const fallback = typeof err === 'string'
                  ? err
                  : (err?.message || 'Error al confirmar el viaje');
                this.dialog.open(WarningDialogComponent, { data: { message: fallback } });
              });
          });
      });
  }

  cargarBuses(): void {
    if (!this.origenId || !this.destinoId || !this.fechaSalida || !this.fechaLlegada || this.precio <= 0) return;

    const filtro: FiltroDisponibilidadOmnibusDto = {
      origenId: this.origenId,
      destinoId: this.destinoId,
      fechaHoraSalida: this.formatFecha(this.fechaSalida, this.horaSalida),
      fechaHoraLlegada: this.formatFecha(this.fechaLlegada, this.horaLlegada),
      minAsientos: 1

    };

    this.busService.getDisponibles(filtro)
      .then(buses => this.buses = buses)
      .catch(() => this.buses = []);
  }


  onBusSeleccionadoChange(): void {
    this.busSeleccionado = this.busSeleccionadoArray[0] ?? null;
  }

  localidadNombre(id: number): string {
    return this.localidades.find(l => l.id === id)?.nombreConDepartamento ?? 'Desconocido';

  }

  deberiaDeshabilitarSiguiente(): boolean {
    if (this.step === 0) {
      return !this.origenId
        || !this.destinoId
        || !this.fechaSalida
        || !this.horaSalida
        || !this.fechaLlegada
        || !this.horaLlegada
        || this.precio <= 0;
    }
    if (this.step === 2) {
      return !this.busSeleccionado;
    }
    return false;
  }

  private formatFecha(fecha: Date | null, hora: string = ''): string {
    if (!fecha) return '';
    const [hh, mm] = hora ? hora.split(':') : ['00', '00'];
    const fechaConHora = new Date(fecha);
    fechaConHora.setHours(Number(hh));
    fechaConHora.setMinutes(Number(mm));
    fechaConHora.setSeconds(0);
    const y = fechaConHora.getFullYear();
    const m = (fechaConHora.getMonth() + 1).toString().padStart(2, '0');
    const d = fechaConHora.getDate().toString().padStart(2, '0');
    const h = fechaConHora.getHours().toString().padStart(2, '0');
    const min = fechaConHora.getMinutes().toString().padStart(2, '0');
    return `${y}-${m}-${d}T${h}:${min}:00`;
  }

  ngAfterViewChecked(): void {
    const headers = document.querySelectorAll('.mat-horizontal-stepper-header');
    headers.forEach((header, index) => {
      const icon = header.querySelector('.mat-step-icon') as HTMLElement;
      const label = header.querySelector('.mat-step-label') as HTMLElement;
      if (index < this.step) {
        icon.style.backgroundColor = '#3e5f3c';
        label.style.color = '#3e5f3c';
      } else if (index === this.step) {
        icon.style.backgroundColor = '#675992';
        label.style.color = '#675992';
      } else {
        icon.style.backgroundColor = '#ccc';
        label.style.color = '#444';
      }
    });
  }

  get salidaCompleta(): Date | null {
    if (!this.fechaSalida || !this.horaSalida) return null;
    const [hh, mm] = this.horaSalida.split(':').map(n => Number(n));
    const d = new Date(this.fechaSalida);
    d.setHours(hh, mm, 0, 0);
    return d;
  }

  get llegadaCompleta(): Date | null {
    if (!this.fechaLlegada || !this.horaLlegada) return null;
    const [hh, mm] = this.horaLlegada.split(':').map(n => Number(n));
    const d = new Date(this.fechaLlegada);
    d.setHours(hh, mm, 0, 0);
    return d;
  }
}

