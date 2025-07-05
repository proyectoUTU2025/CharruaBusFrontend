import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { BusService } from '../../../../../services/bus.service';
import { LocalidadService } from '../../../../../services/localidades.service';
import { ViajeService } from '../../../../../services/viaje.service';
import { LocalidadDto } from '../../../../../models/localidades/localidades-dto.model';
import { FiltroDisponibilidadOmnibusDto, OmnibusDisponibleDto } from '../../../../../models/buses';
import { WarningDialogComponent } from '../../warning-dialog/warning-dialog/warning-dialog.component';
import { LocalidadNombreDepartamentoDto } from '../../../../../models/localidades/localidad-nombre-departamento-dto.model';
import { MaterialUtilsService } from '../../../../../shared/material-utils.service';

@Component({
  standalone: true,
  selector: 'app-alta-viaje-details-dialog',
  templateUrl: './alta-viaje-details-dialog.component.html',
  styleUrls: ['./alta-viaje-details-dialog.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
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
    MatProgressSpinnerModule,
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
  fechaMinima: Date = new Date();
  fechaMinimallegada: Date = new Date();
  horasDisponibles: string[] = [];
  horasLlegadaDisponibles: string[] = [];
  isLoadingBuses = false;
  isLoadingConfirm = false;
  errorMensaje = '';

  constructor(
    private dialogRef: MatDialogRef<AltaViajeDetailsDialogComponent>,
    private busService: BusService,
    private localidadesService: LocalidadService,
    private viajeService: ViajeService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private materialUtilsService: MaterialUtilsService
  ) { }

  async ngOnInit(): Promise<void> {
    this.localidades = await firstValueFrom(this.localidadesService.getAllFlat());
    // Establecer fecha mínima como hoy
    this.fechaMinima.setHours(0, 0, 0, 0);
    this.updateFechaMinimallegada();
    this.generarHorasDisponibles();
    this.generarHorasLlegadaDisponibles();
  }

  generarHorasDisponibles(): void {
    this.horasDisponibles = [];
    const ahora = new Date();
    const esHoy = this.fechaSalida && this.compararSoloFechas(this.fechaSalida, ahora) === 0;

    for (let hora = 0; hora < 24; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 5) {
        // Solo filtrar horarios si la fecha seleccionada es hoy
        if (esHoy && hora === ahora.getHours()) {
          const minutoActual = ahora.getMinutes();
          // Solo incluimos horarios que sean al menos 5 minutos en el futuro
          if (minuto <= minutoActual + 5) {
            continue;
          }
        } else if (esHoy && hora < ahora.getHours()) {
          // Si es hoy y la hora ya pasó, no la incluimos
          continue;
        }
        
        const horaStr = hora.toString().padStart(2, '0');
        const minutoStr = minuto.toString().padStart(2, '0');
        this.horasDisponibles.push(`${horaStr}:${minutoStr}`);
      }
    }
  }

  generarHorasLlegadaDisponibles(): void {
    this.horasLlegadaDisponibles = [];
    const ahora = new Date();
    const esHoy = this.fechaLlegada && this.compararSoloFechas(this.fechaLlegada, ahora) === 0;

    for (let hora = 0; hora < 24; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 5) {
        // Solo filtrar horarios si la fecha seleccionada es hoy
        if (esHoy && hora === ahora.getHours()) {
          const minutoActual = ahora.getMinutes();
          // Solo incluimos horarios que sean al menos 5 minutos en el futuro
          if (minuto <= minutoActual + 5) {
            continue;
          }
        } else if (esHoy && hora < ahora.getHours()) {
          // Si es hoy y la hora ya pasó, no la incluimos
          continue;
        }
        
        const horaStr = hora.toString().padStart(2, '0');
        const minutoStr = minuto.toString().padStart(2, '0');
        this.horasLlegadaDisponibles.push(`${horaStr}:${minutoStr}`);
      }
    }
  }

  updateFechaMinimallegada() {
    if (this.fechaSalida) {
      this.fechaMinimallegada = new Date(this.fechaSalida);
    } else {
      this.fechaMinimallegada = new Date(this.fechaMinima);
    }
  }

  onFechaSalidaChange() {
    this.updateFechaMinimallegada();
    this.generarHorasDisponibles(); // Recalcular horas disponibles

    // Si la fecha de llegada es anterior a la nueva fecha mínima, resetearla
    if (this.fechaLlegada && this.fechaSalida && this.compararSoloFechas(this.fechaLlegada, this.fechaSalida) < 0) {
      this.fechaLlegada = null;
      this.horaLlegada = '';
    }

    // Resetear la hora de salida si ya no es válida
    if (this.horaSalida && !this.horasDisponibles.includes(this.horaSalida)) {
      this.horaSalida = '';
    }
  }

  onFechaLlegadaChange() {
    this.generarHorasLlegadaDisponibles();
    
    // Resetear la hora de llegada si ya no es válida
    if (this.horaLlegada && !this.horasLlegadaDisponibles.includes(this.horaLlegada)) {
      this.horaLlegada = '';
    }
  }

  // Método para forzar la validación visual cuando hay errores críticos
  hasOrigenDestinoError(): boolean {
    return !!(this.origenId && this.destinoId && this.origenId === this.destinoId);
  }

  hasFechaSalidaError(): boolean {
    return !!(this.fechaSalida && !this.esFechaValidaSalida());
  }

  hasFechaLlegadaError(): boolean {
    return !!(this.fechaLlegada && this.fechaSalida && !this.esFechaValidaLlegada());
  }

  hasHorarioError(): boolean {
    if (!this.fechaSalida || !this.fechaLlegada || !this.horaSalida || !this.horaLlegada) {
      return false;
    }

    // Solo validamos horario si es el mismo día
    if (this.compararSoloFechas(this.fechaSalida, this.fechaLlegada) === 0) {
      const salidaCompleta = this.getCombinedDateTime(this.fechaSalida, this.horaSalida);
      const llegadaCompleta = this.getCombinedDateTime(this.fechaLlegada, this.horaLlegada);

      if (salidaCompleta && llegadaCompleta) {
        return llegadaCompleta.getTime() <= salidaCompleta.getTime();
      }
    }

    return false;
  }

  private getCombinedDateTime(date: Date, time: string): Date | null {
    if (!date || !time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  }

  private compararSoloFechas(fecha1: Date, fecha2: Date): number {
    const f1 = new Date(fecha1.getFullYear(), fecha1.getMonth(), fecha1.getDate());
    const f2 = new Date(fecha2.getFullYear(), fecha2.getMonth(), fecha2.getDate());
    return f1.getTime() - f2.getTime();
  }

  esFechaValidaSalida(): boolean {
    if (!this.fechaSalida) return false;
    return this.compararSoloFechas(this.fechaSalida, this.fechaMinima) >= 0;
  }

  esFechaValidaLlegada(): boolean {
    if (!this.fechaLlegada || !this.fechaSalida) return false;
    return this.compararSoloFechas(this.fechaLlegada, this.fechaSalida) >= 0;
  }

  get fechaSalidaFormateada(): string {
    if (!this.fechaSalida) return '';
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' };
    return this.fechaSalida.toLocaleDateString('es-ES', options);
  }

  get fechaLlegadaFormateada(): string {
    if (!this.fechaLlegada) return '';
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' };
    return this.fechaLlegada.toLocaleDateString('es-ES', options);
  }

  siguiente(): void {
    this.errorMensaje = '';
    // Si pasamos de los detalles a las paradas, validamos la lista.
    if (this.step === 0) {
      this.validarParadasExistentes();
    }
    
    this.completedSteps[this.step] = true;
    this.step++;
    if (this.step === 2) this.cargarBuses();
  }

  anterior(): void {
    this.step--;
    this.errorMensaje = '';

    // Si retrocedemos a un paso anterior a la selección de ómnibus (paso 2),
    // limpiamos la selección del bus para obligar a elegir nuevamente.
    if (this.step < 2) {
      this.busSeleccionado = null;
      this.busSeleccionadoArray = [];
    }
  }

  cancelar(): void {
    this.dialogRef.close(false);
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
    if (this.deberiaDeshabilitarSiguiente()) {
      this.errorMensaje = 'Por favor, complete todos los campos requeridos y corrija los errores.';
      return;
    }

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

    const altaDto = {
      omnibusId: this.busSeleccionado!.id,
      origenId: this.origenId,
      destinoId: this.destinoId,
      fechaHoraSalida: this.formatFecha(this.fechaSalida, this.horaSalida),
      fechaHoraLlegada: this.formatFecha(this.fechaLlegada, this.horaLlegada),
      precio: this.precio,
      paradas: paradas,
      confirm: false
    };

    this.enviarAltaViaje(altaDto);
  }

  private enviarAltaViaje(dto: any): void {
    this.isLoadingConfirm = true;
    this.errorMensaje = '';

    this.viajeService.altaViaje(dto).subscribe({
      next: () => {
        this.isLoadingConfirm = false;
        this.materialUtilsService.showSuccess('Viaje creado correctamente.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isLoadingConfirm = false;
        if (err.status === 409 && err.error?.message) {
          const dialogRef = this.dialog.open(WarningDialogComponent, {
            data: { 
              message: err.error.message,
              confirmButtonText: 'Confirmar de todos modos'
            },
            disableClose: true,
          });

          dialogRef.afterClosed().subscribe(confirmado => {
            if (confirmado) {
              this.enviarAltaViaje({ ...dto, confirm: true });
            }
          });
        } else {
          this.errorMensaje = typeof err.error?.message === 'string' 
            ? err.error.message 
            : 'Error inesperado al crear el viaje.';
        }
      }
    });
  }

  cargarBuses(): void {
    if (!this.origenId || !this.destinoId || !this.fechaSalida || !this.fechaLlegada || this.precio <= 0) return;

    this.isLoadingBuses = true;
    this.buses = []; // Limpiamos la lista anterior para evitar mostrar datos viejos

    const filtro: FiltroDisponibilidadOmnibusDto = {
      origenId: this.origenId,
      destinoId: this.destinoId,
      fechaHoraSalida: this.formatFecha(this.fechaSalida, this.horaSalida),
      fechaHoraLlegada: this.formatFecha(this.fechaLlegada, this.horaLlegada),
      minAsientos: 1
    };

    this.busService.getDisponibles(filtro)
      .then(buses => this.buses = buses)
      .catch(() => this.buses = [])
      .finally(() => this.isLoadingBuses = false);
  }


  onBusSeleccionadoChange(): void {
    this.busSeleccionado = this.busSeleccionadoArray[0] ?? null;
  }

  seleccionarBus(bus: OmnibusDisponibleDto): void {
    // Si se hace clic sobre el mismo bus seleccionado, lo deseleccionamos
    if (this.busSeleccionado?.matricula === bus.matricula) {
      this.busSeleccionado = null;
      this.busSeleccionadoArray = [];
    } else {
      this.busSeleccionado = bus;
      this.busSeleccionadoArray = [bus];
    }
  }

  localidadNombre(id: number): string {
    return this.localidades.find(l => l.id === id)?.nombreConDepartamento ?? 'Desconocido';
  }

  deberiaDeshabilitarSiguiente(): boolean {
    if (this.step === 0) {
      // Validaciones básicas
      if (!this.origenId || !this.destinoId || !this.fechaSalida || !this.horaSalida || 
          !this.fechaLlegada || !this.horaLlegada || this.precio <= 0) {
        return true;
      }
      
      // Validación de origen diferente de destino
      if (this.origenId === this.destinoId) {
        return true;
      }
      
      // Validación de fecha de salida no anterior a hoy
      if (!this.esFechaValidaSalida()) {
        return true;
      }
      
      // Validación de fecha de llegada posterior o igual a fecha de salida
      if (!this.esFechaValidaLlegada()) {
        return true;
      }
      
      // Validación de horario
      if (this.hasHorarioError()) {
        return true;
      }
      
      return false;
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

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.paradasIntermedias, event.previousIndex, event.currentIndex);
  }

  validarParadasExistentes(): void {
    this.paradasIntermedias = this.paradasIntermedias.filter(
      paradaId => paradaId !== this.origenId && paradaId !== this.destinoId
    );
  }

  get isHoraSalidaDisabled(): boolean {
    return !this.fechaSalida;
  }

  get isHoraLlegadaDisabled(): boolean {
    return !this.fechaLlegada;
  }
}

