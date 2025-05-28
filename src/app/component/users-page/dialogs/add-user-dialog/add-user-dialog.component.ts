import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TipoDocumento, TipoRol } from '../../../../models/users';

@Component({
  selector: 'app-add-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss']
})
export class AddUserDialogComponent {
  form: FormGroup;
  tiposDocumento = Object.values(TipoDocumento);
  roles = Object.values(TipoRol);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddUserDialogComponent>
  ) {
    this.form = this.fb.group({
      email:            ['', [Validators.required, Validators.email]],
      password:         ['', Validators.required],
      nombre:           ['', Validators.required],
      apellido:         ['', Validators.required],
      documento:        ['', Validators.required],
      tipoDocumento:    ['', Validators.required],
      rol:              ['', Validators.required],
      fechaNacimiento:  ['', Validators.required],
      activo:           [true]
    });
  }

  save(): void {
    if (!this.form.valid) return;
    const raw = this.form.value;
    raw.fechaNacimiento = (raw.fechaNacimiento as Date).toISOString().slice(0, 10);
    this.dialogRef.close(raw);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}