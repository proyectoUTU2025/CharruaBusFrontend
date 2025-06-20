import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BusDto } from '../../../../models/buses/bus.model.dto';



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
  localidades = ['Montevideo', 'Punta del Este', 'Colonia', 'Paysandú', 'Salto', 'Durazno', 'San José'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditBusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BusDto
  ) {
    this.form = this.fb.group({
      id: [data.id],
      matricula: [data.matricula, Validators.required],
      localidad: [data.ubicacionActual, Validators.required],
      cantidadAsientos: [data.capacidad, [Validators.required, Validators.min(1)]],
      estado: [data.activo]
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