import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { TipoDepartamento } from '../../../../../models/localidades/tipo-departamento.enum';
import { LocalidadDto } from '../../../../../models/localidades/localidades-dto.model';

@Component({
  standalone: true,
  selector: 'app-add-localidad-dialog',
  templateUrl: './add-localidad-dialog.component.html',
  styleUrls: ['./add-localidad-dialog.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ]
})
export class AddLocalidadDialogComponent {
  form: FormGroup;
  departamentos = Object.values(TipoDepartamento);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddLocalidadDialogComponent>
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      departamento: ['', Validators.required]
    });
  }

  save(): void {
    if (this.form.valid) {
      const dto: LocalidadDto = this.form.value;
      this.dialogRef.close(dto);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
