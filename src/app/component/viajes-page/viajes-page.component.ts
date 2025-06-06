import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AltaViajeDetailsDialogComponent } from './dialogs/alta-viaje/alta-viaje-details/alta-viaje-details-dialog.component';
import { FiltroBusquedaViajeDto, ViajeDisponibleDto, AltaViajeDto} from '../../models/viajes';
import { ViajeService } from '../../services/viaje.service';
import { Page } from '../../models';
@Component({
  selector: 'app-viajes-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './viajes-page.component.html',
  styleUrls: ['./viajes-page.component.scss']
})
export class ViajesPageComponent implements OnInit, AfterViewInit {
  columns = ['idViaje', 'fechaHoraSalida', 'fechaHoraLlegada', 'origen', 'destino', 'precioEstimado', 'asientosDisponibles'];
  dataSource = new MatTableDataSource<ViajeDisponibleDto>();
  totalElements = 0;

  filtro: {
    localidadOrigenId: number;
    localidadDestinoId: number;
    fechaDesde: string | Date;
    fechaHasta: string | Date;
  } = {
    localidadOrigenId: 1,
    localidadDestinoId: 2,
    fechaDesde: '',
    fechaHasta: ''
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private viajeService: ViajeService, private dialog: MatDialog) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => this.buscar());
    this.buscar();
  }

  buscar(): void {
    const fechaDesde: string = this.filtro.fechaDesde instanceof Date
      ? this.filtro.fechaDesde.toISOString()
      : this.filtro.fechaDesde;

    const fechaHasta: string = this.filtro.fechaHasta instanceof Date
      ? this.filtro.fechaHasta.toISOString()
      : this.filtro.fechaHasta;

    const filtroTransformado: FiltroBusquedaViajeDto = {
      localidadOrigenId: this.filtro.localidadOrigenId,
      localidadDestinoId: this.filtro.localidadDestinoId,
      fechaDesde,
      fechaHasta
    };

    const page = this.paginator?.pageIndex || 0;
    const size = this.paginator?.pageSize || 5;

    this.viajeService.buscar(filtroTransformado, page, size)
      .then((res: Page<ViajeDisponibleDto>) => {
        this.dataSource.data = res.content;
        this.totalElements = res.totalElements;
      })
      .catch(error => {
        console.error('Error al buscar viajes', error);
      });
  }

  limpiarFiltros(): void {
    this.filtro = {
      localidadOrigenId: 0,
      localidadDestinoId: 0,
      fechaDesde: '',
      fechaHasta: ''
    };
    this.dataSource.data = [];
  }

  crearViaje(): void {
    this.dialog.open(AltaViajeDetailsDialogComponent, {
      width: '80vw',
      maxWidth: '700px'
    }).afterClosed().subscribe((alta: AltaViajeDto) => {
      if (!alta) return;
      this.buscar();
    });
  }
}
