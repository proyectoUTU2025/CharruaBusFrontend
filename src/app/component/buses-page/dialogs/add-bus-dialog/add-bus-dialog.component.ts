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
import { AltaBusDto, BusDto } from '../../../../models/buses/bus-dto.model';


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
      localidadId: [null, Validators.required],
      cantidadAsientos: [1, [Validators.required, Validators.min(1)]],
    });

  }

save(): void {
  if (this.form.valid) {
    const alta: AltaBusDto = {
      matricula: this.form.value.matricula,
      cantidadAsientos: this.form.value.cantidadAsientos,
      localidadId: parseInt(this.form.value.localidadId, 10)
    };
    this.dialogRef.close(alta);
  }
}

  cancel(): void {
    this.dialogRef.close();
  }
}