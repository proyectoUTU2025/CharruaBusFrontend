import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AltaViajeDetailsDialogComponent } from './dialogs/alta-viaje/alta-viaje-details/alta-viaje-details-dialog.component';
import { ViajeDetalleDialogComponent } from './dialogs/viaje-detalle-dialog/viaje-detalle-dialog.component';
import { FiltroBusquedaViajeDto, ViajeDisponibleDto, AltaViajeDto } from '../../models/viajes';
import { ViajeService } from '../../services/viaje.service';

import { LocalidadService } from '../../services/localidades.service';
import { LocalidadNombreDepartamentoDto } from '../../models/localidades/localidad-nombre-departamento-dto.model';
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
    MatDialogModule,
    ViajeDetalleDialogComponent
  ],
  templateUrl: './viajes-page.component.html',
  styleUrls: ['./viajes-page.component.scss']
})
export class ViajesPageComponent implements OnInit, AfterViewInit {
  columns = [
    'nombreLocalidadOrigen',
    'nombreLocalidadDestino',
    'fechaHoraSalida',
    'fechaHoraLlegada',
    'precioPorTramo',
    'asientosDisponibles',
    'acciones'
  ];
  dataSource = new MatTableDataSource<ViajeDisponibleDto>();
  totalElements = 0;
  localidades: LocalidadNombreDepartamentoDto[] = [];
  filtro: {
    localidadOrigenId: number | null;
    localidadDestinoId: number | null;
    fechaDesde: string | Date;
    fechaHasta: string | Date;
  } = {
    localidadOrigenId: null,
    localidadDestinoId: null,
    fechaDesde: '',
    fechaHasta: ''
  };
  pageIndex = 0;
  pageSize = 5;  
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private viajeService: ViajeService,
    private dialog: MatDialog,
    private localidadService: LocalidadService
  ) {}

  ngOnInit(): void {
    this.localidadService.getAllFlat().subscribe(ls => this.localidades = ls);
  }

  ngAfterViewInit(): void {    
    this.buscar();
  }

  buscar(): void {
    const fechaDesde = this.filtro.fechaDesde instanceof Date
      ? this.filtro.fechaDesde.toISOString()
      : this.filtro.fechaDesde;
    const fechaHasta = this.filtro.fechaHasta instanceof Date
      ? this.filtro.fechaHasta.toISOString()
      : this.filtro.fechaHasta;
    const filtroTransformado: FiltroBusquedaViajeDto = {
      localidadOrigenId: this.filtro.localidadOrigenId ?? undefined,
      localidadDestinoId: this.filtro.localidadDestinoId ?? undefined,
      fechaDesde,
      fechaHasta
    };

    this.viajeService.buscar(filtroTransformado, this.pageIndex, this.pageSize)
      .then((res: Page<ViajeDisponibleDto>) => {
        this.dataSource.data     = res.content;
        this.totalElements       = res.page.totalElements;
        this.pageIndex           = res.page.number;
        
        this.paginator.length    = res.page.totalElements;
        this.paginator.pageIndex = res.page.number;
      })
      .catch(err => console.error('Error al buscar viajes', err));
  }

  cambiarPagina(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize  = e.pageSize;
    this.buscar();
  }

  limpiarFiltros(): void {
    this.filtro = {
      localidadOrigenId: null,
      localidadDestinoId: null,
      fechaDesde: '',
      fechaHasta: ''
    };
    this.buscar();
  }

  crearViaje(): void {
    this.dialog.open(AltaViajeDetailsDialogComponent, {
      width: '80vw',
      maxWidth: '700px'
    }).afterClosed().subscribe((alta: AltaViajeDto) => {
      if (alta) this.buscar();
    });
  }

  verDetallesViaje(v: ViajeDisponibleDto): void {
    this.viajeService.getDetalleViaje(v.id).then(detalle => {
      this.dialog.open(ViajeDetalleDialogComponent, {
        width: '700px',
        data: { viaje: detalle }
      }).afterClosed().subscribe(r => {
        if (r?.reasignado) this.buscar();
      });
    });
  }
}
