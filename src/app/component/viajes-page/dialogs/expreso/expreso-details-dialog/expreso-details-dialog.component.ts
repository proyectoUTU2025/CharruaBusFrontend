import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ExpresoSelectBusDialogComponent } from '../expreso-select-bus-dialog/expreso-select-bus-dialog.component';

@Component({
  selector: 'app-expreso-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './expreso-details-dialog.component.html',
  styleUrls: ['./expreso-details-dialog.component.scss']
})
export class ExpresoDetailsDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ExpresoDetailsDialogComponent>,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      fecha: [null, Validators.required],
      horaSalida: ['', Validators.required],
      horaLlegada: ['', Validators.required],
      origen: ['', Validators.required],
      destino: ['', Validators.required]
    });
  }

  continuar(): void {
    if (this.form.valid) {
      this.dialog.open(ExpresoSelectBusDialogComponent, {
        width: '600px',
        data: this.form.value
      });
      this.dialogRef.close();
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
