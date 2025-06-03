import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-alta-viaje-details-dialog',
  templateUrl: './alta-viaje-details-dialog.component.html',
  styleUrls: ['./alta-viaje-details-dialog.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule
  ]
})
export class AltaViajeDetailsDialogComponent {
  origenId: number = 0;
  destinoId: number = 0;
  fechaSalida: string = '';
  fechaLlegada: string = '';
  precio: number = 0;

  constructor(
    private dialogRef: MatDialogRef<AltaViajeDetailsDialogComponent>
  ) {}

  confirmar(): void {
    this.dialogRef.close({
      origenId: this.origenId,
      destinoId: this.destinoId,
      fechaSalida: this.fechaSalida,
      fechaLlegada: this.fechaLlegada,
      precio: this.precio
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
