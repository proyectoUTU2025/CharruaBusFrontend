import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { BusDto } from '../../../../../models';
import { BusService } from '../../../../../services/bus.service';

@Component({
  selector: 'app-alta-viaje-select-bus-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatListModule
  ],
  templateUrl: './alta-viaje-select-bus-dialog.component.html',
  styleUrls: ['./alta-viaje-select-bus-dialog.component.scss']
})
export class AltaViajeSelectBusDialogComponent implements OnInit {
  buses: BusDto[] = [];

  constructor(
    private busService: BusService,
    private dialogRef: MatDialogRef<AltaViajeSelectBusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.busService.getAll().then(resp => {
      this.buses = resp.content;
    });
  }

  seleccionar(bus: BusDto) {
    this.dialogRef.close(bus);
  }

  cancelar() {
    this.dialogRef.close();
  }
}
