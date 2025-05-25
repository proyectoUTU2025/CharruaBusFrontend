import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface Localidad {
  id: number;
  departamento: string;
  nombre: string;
  codigo: string;
}

@Component({
  selector: 'app-edit-localidad-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './edit-localidad-dialog.component.html',
  styleUrls: ['./edit-localidad-dialog.component.scss']
})
export class EditLocalidadDialogComponent {
  form: FormGroup;
  departamentos = ['Montevideo', 'Canelones', 'Maldonado', 'Rocha'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditLocalidadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Localidad
  ) {
    this.form = this.fb.group({
      departamento: [data.departamento, Validators.required],
      nombre: [data.nombre, Validators.required],
      codigo: [data.codigo, Validators.required],
    });
  }

  save() {
    if (this.form.valid) {
      const updated = { ...this.data, ...this.form.value };
      this.dialogRef.close(updated);
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
