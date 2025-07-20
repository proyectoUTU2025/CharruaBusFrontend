import { MantenimientoService } from './../../../../services/mantenimiento.service';
import { Component, Inject, inject, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { AsignarMantenimientoDto } from '../../../../models/buses/asignar-mantenimiento-dto.model';
import { MatSelectModule } from '@angular/material/select';
import { MaterialUtilsService } from '../../../../shared/material-utils.service';
import { Subscription } from 'rxjs';

function dateTimeValidator(
  control: AbstractControl
): ValidationErrors | null {
  const fechaInicio = control.get('fechaInicio')?.value;
  const horaInicio = control.get('horaInicio')?.value;
  const fechaFin = control.get('fechaFin')?.value;
  const horaFin = control.get('horaFin')?.value;

  if (fechaInicio && horaInicio && fechaFin && horaFin) {
    const inicio = new Date(fechaInicio);
    const [h1, m1] = horaInicio.split(':');
    inicio.setHours(h1, m1);

    const fin = new Date(fechaFin);
    const [h2, m2] = horaFin.split(':');
    fin.setHours(h2, m2);

    if (fin <= inicio) {
      return { fechaFinAnterior: true };
    }
  }

  return null;
}

@Component({
    selector: 'app-asignar-mantenimiento',
    standalone: true,
    templateUrl: './asignar-mantenimiento.component.html',
    styleUrls: ['./asignar-mantenimiento.component.scss'],
    imports: [
        CommonModule, ReactiveFormsModule, MatButtonModule,
        MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatDialogModule, MatSelectModule,
    ]
})
export class AsignarMantenimientoComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isLoading = false;
    horas: string[] = [];
    horasInicio: string[] = [];
    horasFin: string[] = [];
    minDateInicio: Date;
    minDateFin: Date;
    errorMensaje = '';

    private subs = new Subscription();

    private snackBar = inject(MatSnackBar);
    private mantenimientoService = inject(MantenimientoService);
    private dialogRef = inject(MatDialogRef<AsignarMantenimientoComponent>);
    private fb = inject(FormBuilder);
    private materialUtils = inject(MaterialUtilsService);

    constructor(@Inject(MAT_DIALOG_DATA) public data: { omnibusId: number }) {
        this.minDateInicio = new Date();
        this.minDateFin = this.minDateInicio;

        this.form = this.fb.group(
            {
                motivo: ['', [Validators.required, Validators.maxLength(255)]],
                fechaInicio: [null, Validators.required],
                horaInicio: [null, Validators.required],
                fechaFin: [null, Validators.required],
                horaFin: [null, Validators.required],
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
        this.horasInicio = [...this.horas];
        this.horasFin = [...this.horas];
    }

    ngOnInit() {
        this.subs.add(
            this.form.get('fechaInicio')?.valueChanges.subscribe((value) => {
                this.minDateFin = value || new Date();
                this.form.get('fechaFin')?.setValue(null);
                this.form.get('horaInicio')?.setValue(null);
                this.updateHorasInicio(value);
            })
        );

        this.subs.add(
            this.form.get('fechaFin')?.valueChanges.subscribe(() => {
                this.form.get('horaFin')?.setValue(null);
                this.updateHorasFin();
            })
        );

        this.subs.add(
            this.form.get('horaInicio')?.valueChanges.subscribe(() => {
                this.form.get('horaFin')?.setValue(null);
                this.updateHorasFin();
            })
        );

        this.updateHorasInicio(new Date());
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    // Helper para convertir distintos tipos de fecha (Date, string, Moment) a Date
    private toDate(value: any): Date | null {
        if (!value) return null;
        if (value instanceof Date) return value;
        // Soporta objetos Moment (tienen toDate())
        if (typeof value.toDate === 'function') return value.toDate();
        if (typeof value === 'string') {
            const d = new Date(value);
            return isNaN(d.getTime()) ? null : d;
        }
        return null;
    }

    updateHorasInicio(selectedDate: Date | string | any | null) {
        const now = new Date();
        const dateObj = this.toDate(selectedDate);

        if (
            dateObj &&
            dateObj.getDate() === now.getDate() &&
            dateObj.getMonth() === now.getMonth() &&
            dateObj.getFullYear() === now.getFullYear()
        ) {
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            this.horasInicio = this.horas.filter((h) => {
                const [hour, minute] = h.split(':').map(Number);
                return hour > currentHour || (hour === currentHour && minute > currentMinute);
            });
        } else {
            this.horasInicio = [...this.horas];
        }
    }

    updateHorasFin() {
        const { fechaInicio, horaInicio, fechaFin } = this.form.value;

        const fechaInicioDate = this.toDate(fechaInicio);
        const fechaFinDate = this.toDate(fechaFin);

        if (
            fechaInicioDate &&
            fechaFinDate &&
            fechaInicioDate.getTime() === fechaFinDate.getTime() &&
            horaInicio
        ) {
            this.horasFin = this.horas.filter((h) => h > horaInicio);
        } else {
            this.horasFin = [...this.horas];
        }
    }

    onSubmit() {
        if (this.form.invalid) {
            if (this.form.hasError('fechaFinAnterior')) {
                this.errorMensaje = 'La fecha y hora de fin debe ser posterior a la de inicio.';
                return;
            }
            this.errorMensaje = 'Completa todos los campos obligatorios';
            return;
        }
        const values = this.form.value;
        const dto: AsignarMantenimientoDto = {
            idOmnibus: this.data.omnibusId,
            motivo: values.motivo,
            fechaInicio: this.combinarFechaHora(values.fechaInicio, values.horaInicio),
            fechaFin: this.combinarFechaHora(values.fechaFin, values.horaFin)
        };

        this.isLoading = true;
        this.mantenimientoService.asignarMantenimiento(dto).subscribe({
            next: (resp) => {
                this.isLoading = false;
                this.errorMensaje = '';
                this.showSnackbar(resp.message || 'Mantenimiento creado con éxito');
                this.dialogRef.close('mantenimientoCreado');
            },
            error: (err) => {
                this.isLoading = false;
                if (err.error?.errores) {
                    let msg = '';
                    for (const field in err.error.errores) {
                        if (Array.isArray(err.error.errores[field])) {
                            msg += err.error.errores[field].join(' ') + ' ';
                        }
                    }
                    this.errorMensaje = msg.trim() || 'Error validando datos';
                } else if (err.error?.message) {
                    this.errorMensaje = err.error.message;
                } else {
                    this.errorMensaje = 'Error asignando mantenimiento';
                }
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
            if (control.errors?.['required']) return 'Campo obligatorio';
            if (control.errors?.['maxlength']) return 'Máx. 255 caracteres';
        }
        if (field === 'fechaFin' && this.form.hasError('fechaFinAnterior') && control?.touched) {
            return 'La fecha/hora de fin no puede ser anterior o igual a la de inicio.';
        }
        return null;
    }

    close() {
        this.dialogRef.close(false);
    }

    private showSnackbar(msg: string, ms: number = 3000) {
        this.materialUtils.showError(msg, { duration: ms });
    }
}
