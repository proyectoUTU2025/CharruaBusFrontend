import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MantenimientoService } from '../../../../services/mantenimiento.service';
import { AsignarMantenimientoDto } from '../../../../models/buses/asignar-mantenimiento-dto.model';
import { ApiResponse } from '../../../../models';
import { MantenimientoDto } from '../../../../models/buses/mantenimiento-dto';

@Component({
    selector: 'app-asignar-mantenimiento',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        MatButtonModule,
        MatDialogModule
    ],
    templateUrl: './asignar-mantenimiento.component.html',
    styleUrls: ['./asignar-mantenimiento.component.scss']
})
export class AsignarMantenimientoComponent implements OnInit {
    form: FormGroup;
    isLoading = false;
    horas: string[] = [];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { omnibusId: number },
        private fb: FormBuilder,
        private mantenimientoService: MantenimientoService,
        private snackBar: MatSnackBar,
        private dialogRef: MatDialogRef<AsignarMantenimientoComponent>
    ) {
        this.form = this.fb.group({
            motivo: ['', [Validators.required, Validators.maxLength(255)]],
            fechaInicio: [null, Validators.required],
            horaInicio: [null, Validators.required],
            fechaFin: [null, Validators.required],
            horaFin: [null, Validators.required]
        });

        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 5) {
                const hh = h.toString().padStart(2, '0');
                const mm = m.toString().padStart(2, '0');
                this.horas.push(`${hh}:${mm}`);
            }
        }
    }

    ngOnInit(): void { }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.showSnackbar('Completa todos los campos obligatorios');
            return;
        }
        const v = this.form.value;
        const dto: AsignarMantenimientoDto = {
            idOmnibus: this.data.omnibusId,
            motivo: v.motivo,
            fechaInicio: this.combinarFechaHora(v.fechaInicio, v.horaInicio),
            fechaFin: this.combinarFechaHora(v.fechaFin, v.horaFin)
        };

        this.isLoading = true;
        this.form.disable();

        this.mantenimientoService.asignarMantenimiento(dto).subscribe({
            next: (resp: ApiResponse<MantenimientoDto>) => {
                this.isLoading = false;
                this.form.enable();
                this.showSnackbar(resp.message);
                this.dialogRef.close('mantenimientoCreado');
            },
            error: err => {
                this.isLoading = false;
                this.form.enable();
                if (err.status === 409) {
                    this.showSnackbar('El ómnibus ya tiene un viaje o mantenimiento en ese rango de fechas.');
                } else if (err.error?.errores) {
                    let msg = '';
                    for (const field in err.error.errores) {
                        if (Array.isArray(err.error.errores[field])) {
                            msg += err.error.errores[field].join(' ') + ' ';
                        }
                    }
                    this.showSnackbar(msg.trim() || 'Error validando datos', 4500);
                } else if (err.error?.message) {
                    this.showSnackbar(err.error.message, 3500);
                } else {
                    this.showSnackbar('Error asignando mantenimiento', 3500);
                }
            }
        });
    }

    combinarFechaHora(fecha: Date, hora: string): string {
        const yyyy = fecha.getFullYear();
        const mm = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const dd = fecha.getDate().toString().padStart(2, '0');
        return `${yyyy}-${mm}-${dd}T${hora}:00`;
    }

    getFieldError(field: string): string | null {
        const ctl = this.form.get(field);
        if (ctl?.touched && ctl.invalid) {
            if (ctl.hasError('required')) return 'Campo obligatorio';
            if (ctl.hasError('maxlength')) return 'Máx. 255 caracteres';
        }
        return null;
    }

    close(): void {
        this.dialogRef.close(false);
    }

    private showSnackbar(msg: string, duration = 3000): void {
        this.snackBar.open(msg, 'Cerrar', {
            duration,
            verticalPosition: 'top',
            horizontalPosition: 'center'
        });
    }
}
