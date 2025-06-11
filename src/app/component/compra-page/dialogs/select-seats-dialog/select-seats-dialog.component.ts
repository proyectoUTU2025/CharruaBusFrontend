import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { SeatsComponent } from '../../../seats/seats.component';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  standalone: true,
  selector: 'app-seleccionar-pasajeros-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    SeatsComponent,
    MatFormFieldModule
  ],
  templateUrl: './select-seats-dialog.component.html',
  styleUrls: ['./select-seats-dialog.component.scss']
})
export class SelectSeatsDialogComponent implements OnInit {
  form!: FormGroup;
  selectedSeats: number[] = [];

  constructor(
    public dialogRef: MatDialogRef<SelectSeatsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { pasajeros: number; viajeId: number; cantidadAsientos: number },
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      pasajeros: this.fb.array([])
    });

    for (let i = 0; i < this.data.pasajeros; i++) {
      this.pasajeros.push(
        this.fb.group({
          nombre: ['', Validators.required],
          documento: ['', Validators.required]
        })
      );
    }
  }

  get pasajeros(): FormArray {
    return this.form.get('pasajeros') as FormArray;
  }

  onAsientosSeleccionados(ids: number[]): void {
    this.selectedSeats = ids;
  }

  confirmar(): void {
    if (this.form.valid && this.selectedSeats.length === this.data.pasajeros) {
      this.dialogRef.close({
        pasajeros: this.form.value.pasajeros,
        asientos: this.selectedSeats
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
