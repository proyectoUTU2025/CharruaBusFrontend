import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-localidad-dialog',
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
  templateUrl: './add-localidad-dialog.component.html',
  styleUrls: ['./add-localidad-dialog.component.scss']
})
export class AddLocalidadDialogComponent {
  form: FormGroup;
  departamentos = ['Montevideo', 'Canelones', 'Maldonado', 'Rocha'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddLocalidadDialogComponent>
  ) {
    this.form = this.fb.group({
      departamento: ['', Validators.required],
      nombre: ['', Validators.required],
      codigo: ['', Validators.required],
    });
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
