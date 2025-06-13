import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { SeatsComponent } from '../../../seats/seats.component';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  standalone: true,
  selector: 'app-seleccionar-pasajeros-dialog',
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    SeatsComponent,
    MatFormFieldModule
  ],
  templateUrl: './select-seats-dialog.component.html',
  styleUrls: ['./select-seats-dialog.component.scss']
})
export class SelectSeatsDialogComponent implements OnInit {
  selectedSeats: number[] = [];

  constructor(
    public dialogRef: MatDialogRef<SelectSeatsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      pasajeros: number; 
      viajeId: number; 
      cantidadAsientos: number 
      precio: number
    }
  ) {}

  ngOnInit(): void {}

  onAsientosSeleccionados(ids: number[]): void {    
    this.selectedSeats = ids;
  }

  confirmar(): void {    
    if (this.selectedSeats.length === this.data.pasajeros) {
      this.dialogRef.close({
        asientos: this.selectedSeats
      });
    }
  }
  cancelar(): void {
    this.dialogRef.close();
  }
}
