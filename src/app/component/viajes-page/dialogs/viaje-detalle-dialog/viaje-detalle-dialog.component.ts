import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OmnibusDisponibleDto } from '../../../../models';
import { ViajeDisponibleDto } from '../../../../models/viajes';
import { ReasignarOmnibusDialogComponent } from '../reasignar-omnibus-dialog/reasignar-omnibus-dialog.component';

@Component({
  selector: 'app-viaje-detalle-dialog',
  standalone: true,
  templateUrl: './viaje-detalle-dialog.component.html',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
})
export class ViajeDetalleDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { viaje: ViajeDisponibleDto },
    private dialogRef: MatDialogRef<ViajeDetalleDialogComponent>,
    private dialog: MatDialog
  ) {}

  cerrar() {
    this.dialogRef.close();
  }

  abrirReasignarOmnibus() {
    this.dialog.open(ReasignarOmnibusDialogComponent, {
      data: { viaje: this.data.viaje },
      width: '600px'
    }).afterClosed().subscribe(reasignado => {
      if (reasignado) this.cerrar();
    });
  }
}
