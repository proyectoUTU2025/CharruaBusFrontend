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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ConfiguracionDelSistemaService } from '../../../../services/configuracion-del-sistema.service';
import { MaterialUtilsService } from '../../../../shared/material-utils.service';

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
        MatButtonModule,
        MatProgressSpinnerModule
    ]
})
export class CreateConfiguracionDialogComponent {
    form: FormGroup;
    loading = false;
    error: string | null = null;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<CreateConfiguracionDialogComponent>,
        private service: ConfiguracionDelSistemaService,
        private materialUtils: MaterialUtilsService
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
            this.error = null;
            this.loading = true;
            
            const dto: AltaConfiguracionRequestDto = {
                nombre: this.form.value.nombre,
                valorInt: this.form.value.valorInt,
                valor: this.form.value.valor
            };
            
            this.service.create(dto).subscribe({
                next: () => {
                    this.loading = false;
                    this.materialUtils.showSuccess('Configuración creada');
                    this.dialogRef.close(true);
                },
                error: (error) => {
                    this.loading = false;
                    
                    let errorMessage = 'Error al crear la configuración. Por favor, intenta nuevamente.';
                    
                    if (error?.error?.message) {
                        errorMessage = error.error.message;
                    } else if (typeof error?.error === 'string') {
                        errorMessage = error.error;
                    } else if (error?.message) {
                        errorMessage = error.message;
                    }
                    
                    this.error = errorMessage;
                }
            });
        }
    }

    cancel() {
        this.dialogRef.close();
    }
}
