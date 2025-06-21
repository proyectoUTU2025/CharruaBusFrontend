import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DetalleViajeDto } from '../../../../models/viajes';
import { ReasignarOmnibusDialogComponent } from '../reasignar-omnibus-dialog/reasignar-omnibus-dialog.component';

@Component({
  selector: 'app-viaje-detalle-dialog',
  standalone: true,
  templateUrl: './viaje-detalle-dialog.component.html',  
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
})
export class ViajeDetalleDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { viaje: DetalleViajeDto },
    private dialogRef: MatDialogRef<ViajeDetalleDialogComponent>,
    private dialog: MatDialog
  ) {}

  tieneParadas(): boolean {
    return this.data.viaje.paradas && this.data.viaje.paradas.length >= 2;
  }

  get pasajesDisponibles(): number {
    const v = this.data.viaje;
    const vendibles = v.cantidadPasajesVendibles ?? 0;
    const vendidos = v.cantidadAsientosVendidos ?? 0;
    const reservados = v.cantidadAsientosReservados ?? 0;
    return vendibles - (vendidos + reservados);
  }

  cerrar() {
    this.dialogRef.close();
  }

  abrirReasignarOmnibus() {
    this.dialog.open(ReasignarOmnibusDialogComponent, {
      data: { viaje: this.data.viaje },
      width: '600px'
    }).afterClosed().subscribe(reasignado => {
      if (reasignado) this.dialogRef.close({ reasignado: true });
    });
  }
  get puedeReasignar(): boolean {
    const salida = new Date(this.data.viaje.fechaHoraSalida);
    return salida >= new Date();
  }
}
