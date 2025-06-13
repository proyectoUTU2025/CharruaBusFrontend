import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { ExpresoAdditionalInfoDialogComponent } from '../expreso-additional-info-dialog/expreso-additional-info-dialog.component';

interface Bus {
  matricula: string;
  asientos: number;
  localidad: string;
}

@Component({
  selector: 'app-expreso-select-bus-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTableModule,    
    MatDialogModule
  ],
  templateUrl: './expreso-select-bus-dialog.component.html',
  styleUrls: ['./expreso-select-bus-dialog.component.scss']
})
export class ExpresoSelectBusDialogComponent {
  columns = ['matricula', 'asientos', 'localidad', 'accion'];
  buses: Bus[] = [
    { matricula: 'ABC-123', asientos: 45, localidad: 'Montevideo' },
    { matricula: 'DEF-456', asientos: 40, localidad: 'Colonia' },
    { matricula: 'GHI-789', asientos: 48, localidad: 'Paysandú' }
  ];
  selectedBus: Bus | null = null;

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ExpresoSelectBusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  seleccionar(bus: Bus): void {
    this.selectedBus = bus;
  }

  continuar(): void {
    if (this.selectedBus) {
      const dataFinal = { ...this.data, omnibus: this.selectedBus };
      this.dialog.open(ExpresoAdditionalInfoDialogComponent, {
        width: '600px',
        data: dataFinal
      });
      this.dialogRef.close();
    }
  }

  atras(): void {
    this.dialogRef.close();
  }
}
