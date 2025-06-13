import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { AltaBusDto } from '../../../../../models';

@Component({
  selector: 'app-add-bus-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './add-bus-dialog.component.html',
  styleUrls: ['./add-bus-dialog.component.scss']
})
export class AddBusDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddBusDialogComponent>
  ) {
    this.form = this.fb.group({
      matricula: ['', Validators.required],
      localidadId: [null, Validators.required],
      cantidadAsientos: [null, [Validators.required, Validators.min(1)]]
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.form.valid) {
      const dto: AltaBusDto = {
        matricula: this.form.value.matricula,
        cantidadAsientos: this.form.value.cantidadAsientos,
        localidadId: this.form.value.localidadId
      };
      this.dialogRef.close(dto);
    }
  }
}
