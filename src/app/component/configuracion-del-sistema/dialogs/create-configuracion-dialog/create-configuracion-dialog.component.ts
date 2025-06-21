import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    Validators,
    AbstractControl,
    ValidationErrors,
    ReactiveFormsModule
} from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface AltaConfiguracionRequestDto {
    nombre: string;
    valorInt?: number;
    valor?: string;
}

@Component({
    standalone: true,
    selector: 'app-create-configuracion-dialog',
    templateUrl: './create-configuracion-dialog.component.html',
    styleUrls: ['./create-configuracion-dialog.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ]
})
export class CreateConfiguracionDialogComponent {
    form: FormGroup;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<CreateConfiguracionDialogComponent>
    ) {
        this.form = this.fb.group({
            nombre: ['', Validators.required],
            valorInt: [null],
            valor: ['']
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
            const dto: AltaConfiguracionRequestDto = {
                nombre: this.form.value.nombre,
                valorInt: this.form.value.valorInt,
                valor: this.form.value.valor
            };
            this.dialogRef.close(dto);
        }
    }

    cancel() {
        this.dialogRef.close();
    }
}
