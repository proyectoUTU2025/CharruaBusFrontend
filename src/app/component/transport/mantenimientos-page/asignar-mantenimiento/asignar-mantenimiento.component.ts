import { MantenimientoService } from './../../../../services/mantenimiento.service';
import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { AsignarMantenimientoDto } from '../../../../models/buses/asignar-mantenimiento-dto.model';
import { MatSelectModule } from '@angular/material/select';

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
export class AsignarMantenimientoComponent implements OnInit {
    form: FormGroup;
    isLoading = false;
    horas: string[] = [];

    private snackBar = inject(MatSnackBar);
    private mantenimientoService = inject(MantenimientoService);
    private dialogRef = inject(MatDialogRef<AsignarMantenimientoComponent>);
    private fb = inject(FormBuilder);

    constructor(@Inject(MAT_DIALOG_DATA) public data: { omnibusId: number }) {
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

    ngOnInit() { }

    onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.showSnackbar('Completa todos los campos obligatorios');
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
                    this.showSnackbar(msg.trim() || 'Error validando datos', 4500);
                } else if (err.error?.message) {
                    this.showSnackbar(err.error.message, 3500);
                } else {
                    this.showSnackbar('Error asignando mantenimiento', 3500);
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
        return null;
    }

    close() {
        this.dialogRef.close(false);
    }

    private showSnackbar(msg: string, ms: number = 3000) {
        this.snackBar.open(msg, 'Cerrar', {
            duration: ms,
            verticalPosition: 'top',
            horizontalPosition: 'center'
        });
    }
}
