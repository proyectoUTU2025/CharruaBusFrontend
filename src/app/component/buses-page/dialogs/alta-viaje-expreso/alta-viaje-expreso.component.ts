import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LocalidadService } from '../../../../services/localidades.service';
import { BusService } from '../../../../services/bus.service';
import { ViajeExpresoService } from '../../../../services/viaje-expreso.service';
import { ViajeExpresoRequest } from '../../../../models/viajes/viaje-expreso-request.model';
import { WarningDialogComponent } from '../../../viajes-page/dialogs/warning-dialog/warning-dialog/warning-dialog.component';
import { MaterialUtilsService } from '../../../../shared/material-utils.service';
import { Subscription } from 'rxjs';
import { LocalidadNombreDepartamentoDto } from '../../../../models/localidades/localidad-nombre-departamento-dto.model';

function dateTimeValidator(
  control: AbstractControl
): ValidationErrors | null {
  const fechaSalida = control.get('fechaSalida')?.value;
  const horaSalida = control.get('horaSalida')?.value;
  const fechaLlegada = control.get('fechaLlegada')?.value;
  const horaLlegada = control.get('horaLlegada')?.value;

  if (fechaSalida && horaSalida && fechaLlegada && horaLlegada) {
    const salida = new Date(fechaSalida);
    const [h1, m1] = horaSalida.split(':');
    salida.setHours(h1, m1);

    const llegada = new Date(fechaLlegada);
    const [h2, m2] = horaLlegada.split(':');
    llegada.setHours(h2, m2);

    if (llegada <= salida) {
      return { fechaLlegadaAnterior: true };
    }
  }

  return null;
}

@Component({
    selector: 'app-alta-viaje-expreso',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, MatButtonModule,
        MatFormFieldModule, MatSelectModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule
    ],
    templateUrl: './alta-viaje-expreso.component.html',
    styleUrls: ['./alta-viaje-expreso.component.scss']
})
export class AltaViajeExpresoComponent implements OnInit, OnDestroy {
    @Input() omnibusIdPreseleccionado: number | null = null;

    form: FormGroup;
    localidades: LocalidadNombreDepartamentoDto[] = [];
    buses: any[] = [];
    omnibusSeleccionado: string = '';
    isLoading = false;
    horas: string[] = [];
    horasSalida: string[] = [];
    horasLlegada: string[] = [];
    minDateSalida: Date;
    minDateLlegada: Date;
    errorMensaje = '';

    private subs = new Subscription();

    constructor(
        private fb: FormBuilder,
        private busService: BusService,
        private localidadService: LocalidadService,
        private viajeExpresoService: ViajeExpresoService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<AltaViajeExpresoComponent>,
        private materialUtils: MaterialUtilsService
    ) {
        this.minDateSalida = new Date();
        this.minDateLlegada = this.minDateSalida;

        this.form = this.fb.group(
            {
                omnibusId: [null, Validators.required],
                destinoId: [null, Validators.required],
                fechaSalida: [null, Validators.required],
                horaSalida: [null, Validators.required],
                fechaLlegada: [null, Validators.required],
                horaLlegada: [null, Validators.required],
            },
            { validators: dateTimeValidator }
        );

        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 5) {
                const hh = h.toString().padStart(2, '0');
                const mm = m.toString().padStart(2, '0');
                this.horas.push(`${hh}:${mm}`);
            }
        }
        this.horasSalida = [...this.horas];
        this.horasLlegada = [...this.horas];
    }

    ngOnInit() {
        const omnibusId = this.data?.omnibusId || this.omnibusIdPreseleccionado;
        if (omnibusId) {
            this.form.patchValue({ omnibusId: +omnibusId });
            this.loadOmnibusInfo(+omnibusId);
        }
        this.loadLocalidades();

        this.subs.add(
            this.form.get('fechaSalida')?.valueChanges.subscribe((value) => {
                this.minDateLlegada = value || new Date();
                this.form.get('fechaLlegada')?.setValue(null);
                this.form.get('horaSalida')?.setValue(null);
                this.updateHorasSalida(value);
            })
        );

        this.subs.add(
            this.form.get('fechaLlegada')?.valueChanges.subscribe(() => {
                this.form.get('horaLlegada')?.setValue(null);
                this.updateHorasLlegada();
            })
        );

        this.subs.add(
            this.form.get('horaSalida')?.valueChanges.subscribe(() => {
                this.form.get('horaLlegada')?.setValue(null);
                this.updateHorasLlegada();
            })
        );

        this.updateHorasSalida(new Date());
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    updateHorasSalida(selectedDate: Date | null) {
        const now = new Date();
        if (
            selectedDate &&
            selectedDate.getDate() === now.getDate() &&
            selectedDate.getMonth() === now.getMonth() &&
            selectedDate.getFullYear() === now.getFullYear()
        ) {
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            this.horasSalida = this.horas.filter((h) => {
                const [hour, minute] = h.split(':').map(Number);
                return hour > currentHour || (hour === currentHour && minute > currentMinute);
            });
        } else {
            this.horasSalida = [...this.horas];
        }
    }

    updateHorasLlegada() {
        const { fechaSalida, horaSalida, fechaLlegada } = this.form.value;

        if (
            fechaSalida &&
            fechaLlegada &&
            new Date(fechaSalida).getTime() === new Date(fechaLlegada).getTime() &&
            horaSalida
        ) {
            this.horasLlegada = this.horas.filter((h) => h > horaSalida);
        } else {
            this.horasLlegada = [...this.horas];
        }
    }

    loadOmnibusInfo(omnibusId: number) {
        this.busService.getById(omnibusId).subscribe({
            next: (bus) => {
                this.omnibusSeleccionado = `${bus.matricula}`;
            },
            error: () => {
                this.omnibusSeleccionado = 'Error cargando información del ómnibus';
            }
        });
    }

    loadLocalidades() {
        this.localidadService.getAllFlat().subscribe({
            next: resp => this.localidades = resp,
            error: () => this.showSnackbar('Error cargando localidades')
        });
    }

    onSubmit(confirm: boolean = false) {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            if (this.form.hasError('fechaLlegadaAnterior')) {
                this.errorMensaje = 'La fecha y hora de llegada debe ser posterior a la de salida.';
                return;
            }
            this.errorMensaje = 'Completa todos los campos';
            return;
        }

        const values = this.form.value;
        const fechaHoraSalida = this.combinarFechaHora(values.fechaSalida, values.horaSalida);
        const fechaHoraLlegada = this.combinarFechaHora(values.fechaLlegada, values.horaLlegada);

        const dto: ViajeExpresoRequest = {
            omnibusId: values.omnibusId,
            destinoId: values.destinoId,
            fechaHoraSalida,
            fechaHoraLlegada,
            confirm: confirm
        };

        this.isLoading = true;

        this.viajeExpresoService.crearViajeExpreso(dto).subscribe({
            next: () => {
                this.errorMensaje = '';
                this.showSnackbar('¡Viaje registrado correctamente!');
                this.isLoading = false;
                this.form.reset();
                this.dialogRef.close('viajeRegistrado');
            },
            error: (err) => {
                this.isLoading = false;
                if (err.status === 409 && err.error && err.error.message) {
                    this.errorMensaje = '';
                    this.dialog.open(WarningDialogComponent, {
                        data: {
                            title: 'Confirmar acción',
                            message: err.error.message,
                            confirmButtonText: 'Confirmar de todos modos'
                        }
                    }).afterClosed().subscribe(confirmar => {
                        if (confirmar) {
                            this.onSubmit(true);
                        }
                    });
                }
                else if (err.status === 400 && err.error && err.error.errores) {
                    const errores = err.error.errores;
                    let msg = '';
                    for (const field in errores) {
                        if (Array.isArray(errores[field])) {
                            msg += errores[field].join(' ') + ' ';
                        }
                    }
                    this.errorMensaje = msg.trim() || 'Error validando datos';
                }
                else if (err.error && err.error.message) {
                    this.errorMensaje = err.error.message;
                }
                else {
                    this.errorMensaje = 'Error registrando viaje';
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    combinarFechaHora(fecha: string | Date, hora: string): string {
        if (!fecha || !hora) return '';
        const f = new Date(fecha);
        const yyyy = f.getFullYear();
        const mm = (f.getMonth() + 1).toString().padStart(2, '0');
        const dd = f.getDate().toString().padStart(2, '0');
        return `${yyyy}-${mm}-${dd}T${hora}:00`;
    }

    getFieldError(field: string): string | null {
        const control = this.form.get(field);
        if (control && control.touched && control.invalid) {
            if (control.errors?.['required']) return 'Este campo es obligatorio';
        }
        if (field === 'fechaLlegada' && this.form.hasError('fechaLlegadaAnterior') && control?.touched) {
            return 'La fecha/hora de llegada no puede ser anterior o igual a la de salida.';
        }
        return null;
    }

    close() {
        this.dialogRef.close(false);
    }

    private showSnackbar(msg: string, ms: number = 3000) {
        this.materialUtils.showError(msg, { duration: ms });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
