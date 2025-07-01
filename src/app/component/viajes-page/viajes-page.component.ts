import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
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
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
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
    ReactiveFormsModule,
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
    MatSortModule,
    MatTooltipModule,
    LoadingSpinnerComponent,
    ViajeDetalleDialogComponent
  ],
  templateUrl: './viajes-page.component.html',
  styleUrls: ['./viajes-page.component.scss']
})
export class ViajesPageComponent implements OnInit {
  columns = [
    'nombreLocalidadOrigen',
    'nombreLocalidadDestino',
    'fechaHoraSalida',
    'fechaHoraLlegada',
    'precioPorTramo',
    'asientosDisponibles',
    'acciones'
  ];
  
  filterForm: FormGroup;
  viajes: ViajeDisponibleDto[] = [];
  totalElements = 0;
  localidades: LocalidadNombreDepartamentoDto[] = [];
  pageIndex = 0;
  pageSize = 5;
  isLoading = true;
  hasSearched = false;
  
  private paginator!: MatPaginator;
  private sort!: MatSort;
  
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    if (mp) {
      this.paginator = mp;
    }
  }

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    if (ms) {
      this.sort = ms;
      this.sort.sortChange.subscribe((event: Sort) => {
        console.log('SortChange event', event);
        this.pageIndex = 0;
        this.buscar(event);
      });
    }
  }

  constructor(
    private fb: FormBuilder,
    private viajeService: ViajeService,
    private dialog: MatDialog,
    private localidadService: LocalidadService
  ) {
    this.filterForm = this.fb.group({
      localidadOrigenId: [null],
      localidadDestinoId: [null],
      fechaDesde: [null],
      fechaHasta: [null]
    });
  }

  ngOnInit(): void {
    this.localidadService.getAllFlat().subscribe(ls => this.localidades = ls);
    this.buscar();
  }

  private getCurrentSort(): Sort | undefined {
    return this.sort?.active && this.sort?.direction ? 
      { active: this.sort.active, direction: this.sort.direction } as Sort : 
      undefined;
  }

  buscar(sortEvent?: Sort): void {
    const isSortRequest = !!sortEvent;
    if (!isSortRequest) {
      this.isLoading = true;
    }
    this.hasSearched = true;

    const f = this.filterForm.value;
    const fechaDesde = f.fechaDesde instanceof Date
      ? f.fechaDesde.toISOString()
      : f.fechaDesde;
    const fechaHasta = f.fechaHasta instanceof Date
      ? f.fechaHasta.toISOString()
      : f.fechaHasta;
    
    const filtroTransformado: FiltroBusquedaViajeDto = {
      localidadOrigenId: f.localidadOrigenId ?? undefined,
      localidadDestinoId: f.localidadDestinoId ?? undefined,
      fechaDesde,
      fechaHasta
    };

    this.viajeService.buscar(filtroTransformado, this.pageIndex, this.pageSize)
      .then((res: Page<ViajeDisponibleDto>) => {
        this.viajes = res.content;
        this.totalElements = res.page.totalElements;
        this.pageIndex = res.page.number;
      })
      .catch(err => console.error('Error al buscar viajes', err))
      .finally(() => {
        if (!isSortRequest) {
          this.isLoading = false;
        }
      });
  }

  onSearch(): void {
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.buscar(this.getCurrentSort());
  }

  onClear(): void {
    this.filterForm.reset({
      localidadOrigenId: null,
      localidadDestinoId: null,
      fechaDesde: null,
      fechaHasta: null
    });
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.buscar(this.getCurrentSort());
  }

  cambiarPagina(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.buscar(this.getCurrentSort());
  }

  crearViaje(): void {
    this.openAltaViajeDialog();
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

  openAltaViajeDialog(): void {
    const dialogRef = this.dialog.open(AltaViajeDetailsDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.buscar();
      }
    });
  }
}
