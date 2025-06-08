import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { ViajeService } from '../../services/viaje.service';
import { Viaje } from '../../models';
import { ExpresoDetailsDialogComponent } from './dialogs/expreso-details-dialog/expreso-details-dialog.component';

@Component({
  selector: 'app-viajes-page',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  providers: [ViajeService],
  templateUrl: './viajes-page.component.html',
  styleUrls: ['./viajes-page.component.scss']
})
export class ViajesPageComponent implements OnInit {
  columns = [
    'id',
    'fechaSalida',
    'fechaLlegada',
    'horaSalida',
    'horaLlegada',
    'origen',
    'destino',
    'precio',
    'pasajesVendibles',
    'tipo',
    'venta'
  ];
  dataSource = new MatTableDataSource<Viaje>();

  constructor(private viajeService: ViajeService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.viajeService.getAll().subscribe({
      next: (viajes) => {
        this.dataSource.data = viajes;
      },
      error: (err) => {
        console.error('Error al cargar viajes desde el backend:', err);
      }
    });
  }

  openCrearViajeExpreso(): void {
    this.dialog.open(ExpresoDetailsDialogComponent, {
      width: '600px'
    });
  }
}
