import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DetalleViajeDto } from '../../../../models/viajes';
import { BusService } from '../../../../services/bus.service';
import { ViajeService } from '../../../../services/viaje.service';
import { WarningDialogComponent } from '../warning-dialog/warning-dialog/warning-dialog.component';
import { OmnibusDisponibleDto } from '../../../../models';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-reasignar-omnibus-dialog',
  standalone: true,
  templateUrl: './reasignar-omnibus-dialog.component.html',
  styleUrls: ['./reasignar-omnibus-dialog.component.scss'],
  imports: [ 
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    FormsModule,
    WarningDialogComponent
  ]
})
export class ReasignarOmnibusDialogComponent implements OnInit {
  busesDisponibles: OmnibusDisponibleDto[] = [];
  omnibusSeleccionadoId: number | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { viaje: DetalleViajeDto },
    private busService: BusService,
    private viajeService: ViajeService,
    private dialogRef: MatDialogRef<ReasignarOmnibusDialogComponent>,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const { id } = this.data.viaje;

    this.busService.getDisponiblesParaReasignar(id).then(buses => {
      this.busesDisponibles = buses;
    });
  }

  confirmarReasignacion(): void {
    if (!this.omnibusSeleccionadoId) return;

    const body = {
      nuevoOmnibusId: this.omnibusSeleccionadoId,
      confirm: false
    };

    this.viajeService.reasignar(this.data.viaje.id, body)
      .then(() => this.dialogRef.close(true))
      .catch(mensaje => {
        this.dialog.open(WarningDialogComponent, {
          data: { message: mensaje }
        }).afterClosed().subscribe(confirmado => {
          if (confirmado) {
            this.viajeService.reasignar(this.data.viaje.id, { ...body, confirm: true })
              .then(() => this.dialogRef.close(true))
              .catch(error => {
                this.dialog.open(WarningDialogComponent, {
                  data: { message: typeof error === 'string' ? error : 'Error al confirmar reasignación' }
                });
              });
          }
        });
      });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
