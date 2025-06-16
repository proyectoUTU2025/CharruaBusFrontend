import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {
    MatDialogModule,
    MatDialogRef,
    MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BusDto } from '../../../../../models/buses/bus-dto.model';

@Component({
    standalone: true,
    selector: 'app-edit-bus-dialog',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './edit-bus-dialog.component.html',
    styleUrls: ['./edit-bus-dialog.component.scss']
})
export class EditBusDialogComponent {
    form: FormGroup;
    localidades = [
        { id: 1, nombre: 'Montevideo' },
        { id: 2, nombre: 'Punta del Este' },
        { id: 3, nombre: 'Colonia' },
        { id: 4, nombre: 'Paysandú' },
        { id: 5, nombre: 'Salto' },
        { id: 6, nombre: 'Durazno' },
        { id: 7, nombre: 'San José' }
    ];

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<EditBusDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: BusDto
    ) {
        this.form = this.fb.group({
            id: [data.id],
            matricula: [data.matricula, Validators.required],
            localidadId: [(data as any).localidadId ?? null, Validators.required],
            capacidad: [data.capacidad, [Validators.required, Validators.min(1)]],
            activo: [data.activo]
        });
    }

    save(): void {
        if (this.form.valid) {
            this.dialogRef.close(this.form.value);
        }
    }

    cancel(): void {
        this.dialogRef.close();
    }
}
