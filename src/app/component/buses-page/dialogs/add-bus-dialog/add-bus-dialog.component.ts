import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Bus } from '../../../../models/bus';


@Component({
  standalone: true,
  selector: 'app-add-bus-dialog',
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
  templateUrl: './add-bus-dialog.component.html',
  styleUrls: ['./add-bus-dialog.component.scss']
})
export class AddBusDialogComponent {
  form: FormGroup;
  localidades = ['Montevideo', 'Punta del Este', 'Colonia', 'Paysandú', 'Salto', 'Durazno', 'San José'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddBusDialogComponent>
  ) {
    this.form = this.fb.group({
      matricula: ['', Validators.required],
      localidad: [this.localidades[0], Validators.required],
      cantidadAsientos: [0, [Validators.required, Validators.min(1)]],
      estado: [true]
    });
  }

  save(): void {
    if (this.form.valid) {
      const bus: Bus = this.form.value;
      this.dialogRef.close(bus);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}