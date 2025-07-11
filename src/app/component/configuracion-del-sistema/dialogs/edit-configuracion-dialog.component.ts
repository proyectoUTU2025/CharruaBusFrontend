import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    Validators,
    AbstractControl,
    ValidationErrors,
    ReactiveFormsModule
} from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Configuracion } from '../../../models/configuracion';

@Component({
    standalone: true,
    selector: 'app-edit-configuracion-dialog',
    templateUrl: './edit-configuracion-dialog.component.html',
    styleUrls: ['./edit-configuracion-dialog.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ]
})
export class EditConfiguracionDialogComponent {
    form: FormGroup;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<EditConfiguracionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public config: Configuracion & { id: number | null }
    ) {
        const valorIntValidators = [Validators.min(0)];
        const percentageConfigs = ['descuento_estudiante', 'descuento_jubilado', 'penalizacion_porcentaje'];
        if (config.nombre && percentageConfigs.includes(config.nombre)) {
            valorIntValidators.push(Validators.max(100));
        }

        this.form = this.fb.group({
            id: [config.id],
            nombre: [{ value: config.nombre || '', disabled: config.id != null }, Validators.required],
            valorInt: [config.valorInt ?? null, valorIntValidators],
            valor: [config.valor ?? null]
        }, { validators: [this.oneOfTwo('valorInt', 'valor')] });
    }

    oneOfTwo(a: string, b: string) {
        return (g: AbstractControl): ValidationErrors | null => {
            const one = !!g.get(a)?.value;
            const two = !!g.get(b)?.value;
            return one !== two ? null : { oneOfTwo: true };
        };
    }

    save() {
        if (this.form.valid) {
            this.dialogRef.close(this.form.getRawValue() as Configuracion);
        }
    }

    cancel() {
        this.dialogRef.close();
    }
}
