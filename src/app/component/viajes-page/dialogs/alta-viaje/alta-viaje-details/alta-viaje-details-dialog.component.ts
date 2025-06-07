import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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

@Component({
  selector: 'app-alta-viaje-details-dialog',
  standalone: true,
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
  localidades: LocalidadDto[] = [];
  buses: OmnibusDisponibleDto[] = [];
  origenId = 0;
  destinoId = 0;
  fechaSalida: Date | null = null;
  fechaLlegada: Date | null = null;
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
  ) {}

  async ngOnInit(): Promise<void> {
    const page = await firstValueFrom(this.localidadesService.getAll({}, 0, 1000));
    this.localidades = page.content;
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
      this.paradaIntermediaId &&
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
    const salida = new Date(this.fechaSalida);
    const llegada = new Date(this.fechaLlegada);
    const intervalo = (llegada.getTime() - salida.getTime()) / (total - 1);

    const localidades = [this.origenId, ...this.paradasIntermedias, this.destinoId];
    const paradas = localidades.map((id, idx) => ({
      localidadId: id,
      orden: idx + 1,
      fechaHoraLlegada: new Date(salida.getTime() + idx * intervalo).toISOString()
    }));

    const alta = {
      origenId: this.origenId,
      destinoId: this.destinoId,
      fechaHoraSalida: this.formatFecha(this.fechaSalida),
      fechaHoraLlegada: this.formatFecha(this.fechaLlegada),
      precio: this.precio,
      omnibusId: this.busSeleccionado.id,
      paradas,
      confirm: false
    };

    this.viajeService.altaViaje(alta).then(() => {
      this.dialogRef.close(alta);
    }).catch(mensaje => {
      this.dialog.open(WarningDialogComponent, {
        data: { message: mensaje }
      }).afterClosed().subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.viajeService.altaViaje({ ...alta, confirm: true }).then(() => {
            this.dialogRef.close(alta);
          }).catch(err => {
            const fallback = typeof err === 'string' ? err : (err?.message || 'Error al confirmar el viaje');
            this.dialog.open(WarningDialogComponent, {
              data: { message: fallback }
            });
          });
        }
      });
    });
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

  onBusSeleccionadoChange(): void {
    this.busSeleccionado = this.busSeleccionadoArray[0] ?? null;
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


}
