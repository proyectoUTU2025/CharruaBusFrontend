import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { BusService } from '../../services/bus.service';
import { Bus } from '../../models/bus';
import { AddBusDialogComponent } from './dialogs/add-bus-dialog/add-bus-dialog.component';
import { EditBusDialogComponent } from './dialogs/edit-bus-dialog/edit-bus-dialog.component';
import { ConfirmBusDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { BulkUploadBusDialogComponent } from './dialogs/bulk-upload-bus-dialog/bulk-upload-bus-dialog.component';


@Component({
  selector: 'app-buses-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    AddBusDialogComponent,
    EditBusDialogComponent,
    ConfirmBusDialogComponent,    
    BulkUploadBusDialogComponent
  ],
  templateUrl: './buses-page.component.html',
  styleUrls: ['./buses-page.component.scss']
})
export class BusesPageComponent implements OnInit {
  columns = [
    'id',
    'matricula',
    'localidad',
    'cantidadAsientos',
    'estado',
    'acciones'
  ];
  dataSource = new MatTableDataSource<Bus>();

  constructor(
    private busService: BusService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadBuses();
  }

  private loadBuses() {
    this.busService.getAll().subscribe(buses => {
      this.dataSource.data = buses;
    });
  }
  openBulkUpload() {
    this.dialog.open(BulkUploadBusDialogComponent, { width: '600px' })
      .afterClosed()
      .subscribe(file => {
        // aquí procesarías el CSV devuelto si quieres recargar
        this.loadBuses();
      });
  }

  add() {
    this.dialog.open(AddBusDialogComponent, { width: '400px', maxHeight: '95vh' })
      .afterClosed()
      .subscribe((bus: Bus) => {
        if (bus) {
          this.busService.create(bus).subscribe(() => this.loadBuses());
        }
      });
  }

  edit(bus: Bus) {
    this.dialog.open(EditBusDialogComponent, { width: '400px', data: bus })
      .afterClosed()
      .subscribe((updated: Bus) => {
        if (updated) {
          this.busService.update(updated).subscribe(() => this.loadBuses());
        }
      });
  }

  remove(bus: Bus) {
    this.dialog.open(ConfirmBusDialogComponent, {
      width: '300px',
      data: {
        title: 'Confirmar eliminación',
        message: `¿Eliminar ómnibus ${bus.matricula}?`
      }
    })
    .afterClosed()
    .subscribe((ok: boolean) => {
      if (ok && bus.id !== undefined) {
        this.busService.delete(bus.id).subscribe(() => this.loadBuses());
      }
    });
  }
}
