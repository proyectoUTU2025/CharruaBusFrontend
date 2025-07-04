import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { SeatsComponent } from '../../../seats/seats.component';

export interface SelectSeatsDialogData {
  totalAsientos: number;
  asientosOcupados: number[];
  asientosSeleccionados: number[];
  maxSeleccion: number;
}

@Component({
  selector: 'app-select-seats-dialog',
  templateUrl: './select-seats-dialog.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    SeatsComponent
  ]
})
export class SelectSeatsDialogComponent implements OnInit {
  selectedSeats: number[] = [];

  constructor(
    public dialogRef: MatDialogRef<SelectSeatsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SelectSeatsDialogData
  ) {}

  ngOnInit(): void {
    // Clonamos los asientos seleccionados para no modificar el array original
    this.selectedSeats = [...this.data.asientosSeleccionados];
  }

  onSelectionChange(seats: number[]): void {
    this.selectedSeats = seats;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
