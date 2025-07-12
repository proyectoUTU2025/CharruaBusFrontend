import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
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
import { MaterialUtilsService } from '../../shared/material-utils.service';
import { merge, Subject } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';

export const origenDestinoValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const origen = control.get('localidadOrigenId');
  const destino = control.get('localidadDestinoId');
  
  if (origen && destino && origen.value && destino.value && origen.value === destino.value) {
    return { origenDestinoIguales: true };
  }
  
  return null;
};

export const fechasValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const fechaDesde = control.get('fechaDesde');
  const fechaHasta = control.get('fechaHasta');
  
  if (fechaDesde && fechaHasta && fechaDesde.value && fechaHasta.value) {
    const desde = new Date(fechaDesde.value);
    const hasta = new Date(fechaHasta.value);
    
    if (desde > hasta) {
      return { fechaDesdeInvalida: true };
    }
  }
  
  return null;
};

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
export class ViajesPageComponent implements OnInit, AfterViewInit, OnDestroy {
  columns = [
    'id',
    'nombreLocalidadOrigen',
    'nombreLocalidadDestino',
    'fechaHoraSalida',
    'fechaHoraLlegada',
    'precioTotal',
    'asientosDisponibles',
    'ventaDisponible',
    'acciones'
  ];
  
  filterForm: FormGroup;
  viajes: ViajeDisponibleDto[] = [];
  totalElements = 0;
  localidades: LocalidadNombreDepartamentoDto[] = [];
  isLoading = true;
  hasSearched = false;
  minDateForHasta: Date | null = null;
  private destroy$ = new Subject<void>();
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  horasDisponibles = this.generateTimeOptions();
  
  constructor(
    private fb: FormBuilder,
    private viajeService: ViajeService,
    private dialog: MatDialog,
    private localidadService: LocalidadService,
    private materialUtils: MaterialUtilsService
  ) {
    const hoy = new Date();
    const unMesDespues = new Date();
    unMesDespues.setMonth(unMesDespues.getMonth() + 1);

    this.filterForm = this.fb.group({
      localidadOrigenId: [null],
      localidadDestinoId: [null],
      fechaDesde: [hoy],
      fechaHasta: [unMesDespues],
      horaDesde: [''],
      horaHasta: ['']
    }, { validators: [origenDestinoValidator, fechasValidator] });
  }

  ngOnInit(): void {
    this.localidadService.getAllFlat().subscribe(ls => this.localidades = ls);
    this.setupDateFilters();

    const fechaDesdeControl = this.filterForm.get('fechaDesde');
    if (fechaDesdeControl?.value) {
      this.minDateForHasta = new Date(fechaDesdeControl.value);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupDateFilters(): void {
    this.filterForm.get('fechaDesde')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.minDateForHasta = value ? new Date(value) : null;
        
        const fechaHastaControl = this.filterForm.get('fechaHasta');
        if (fechaHastaControl?.value && this.minDateForHasta && fechaHastaControl.value < this.minDateForHasta) {
          fechaHastaControl.setValue(null);
        }
      });
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        takeUntil(this.destroy$),
        tap(() => this.buscar())
      )
      .subscribe();

    this.buscar();
  }

  private buildSortParam(): string {
    const activeField = this.sort?.active;
    const direction = this.sort?.direction;
    if (!activeField || !direction) {
      return 'fechaHoraSalida,asc';
    }
    let backendField = activeField;
    if (activeField === 'precioTotal') {
      backendField = 'precio';
    }
    const dir = direction.toLowerCase();
    return `${backendField},${dir}`;
  }

  buscar(): void {
    this.isLoading = true;
    this.hasSearched = true;

    const f = this.filterForm.value;
    
    const buildDateTime = (fecha: Date | null, hora: string): string | undefined => {
      if (!fecha) return undefined;
      const timeToUse = hora || '00:00';
      const [hh, mm] = timeToUse.split(':').map(Number);
      const dt = new Date(fecha);
      dt.setHours(hh, mm, 0, 0);
      const year = dt.getFullYear();
      const month = (dt.getMonth() + 1).toString().padStart(2, '0');
      const day = dt.getDate().toString().padStart(2, '0');
      const hours = dt.getHours().toString().padStart(2, '0');
      const minutes = dt.getMinutes().toString().padStart(2, '0');
      const seconds = dt.getSeconds().toString().padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const fechaDesde = buildDateTime(f.fechaDesde, f.horaDesde);
    const fechaHasta = buildDateTime(f.fechaHasta, f.horaHasta);
    
    const filtroTransformado: FiltroBusquedaViajeDto = {
      localidadOrigenId: f.localidadOrigenId ?? undefined,
      localidadDestinoId: f.localidadDestinoId ?? undefined,
      fechaDesde: fechaDesde ?? '',
      fechaHasta
    };

    const sortParam = this.buildSortParam();
    const pageIndex = this.paginator?.pageIndex || 0;
    const pageSize = this.paginator?.pageSize || 5;

    this.viajeService.buscar(filtroTransformado, pageIndex, pageSize, sortParam)
      .then((res: Page<ViajeDisponibleDto>) => {
        this.viajes = res.content || [];
        this.totalElements = res.page?.totalElements || 0;
      })
      .catch(err => {
        console.error('Error al buscar viajes', err)
        this.materialUtils.showError('Error al cargar los viajes. Por favor, intente de nuevo.');
        this.viajes = [];
        this.totalElements = 0;
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  onSearch(): void {
    if (this.filterForm.invalid) {
      if (this.filterForm.hasError('origenDestinoIguales')) {
        this.materialUtils.showError('El origen y destino no pueden ser iguales');
      } else if (this.filterForm.hasError('fechaDesdeInvalida')) {
        this.materialUtils.showError('La fecha desde no puede ser mayor que la fecha hasta');
      } else {
        this.materialUtils.showError('Corrige los filtros antes de buscar');
      }
      return;
    }
    const f = this.filterForm.value;

    const tieneFechaDesde = f.fechaDesde !== null;
    const tieneFechaHasta = f.fechaHasta !== null;

    if (tieneFechaDesde !== tieneFechaHasta) {
      this.materialUtils.showError('Si especificas fecha desde, también debes especificar fecha hasta y viceversa.');
      return;
    }

    if (tieneFechaDesde && tieneFechaHasta) {
      const fechaDesde = new Date(f.fechaDesde);
      const fechaHasta = new Date(f.fechaHasta);

      const applyTime = (date: Date, timeStr: string) => {
        const [hh, mm] = (timeStr || '00:00').split(':').map(Number);
        date.setHours(hh, mm, 0, 0);
      };
      applyTime(fechaDesde, f.horaDesde);
      applyTime(fechaHasta, f.horaHasta);

      if (fechaHasta <= fechaDesde) {
        this.materialUtils.showError('La fecha/hora hasta debe ser posterior a la fecha/hora desde.');
        return;
      }
    }

    this.paginator.pageIndex = 0;
    this.buscar();
  }

  onClear(): void {
    this.filterForm.reset({
      localidadOrigenId: null,
      localidadDestinoId: null,
      fechaDesde: null,
      fechaHasta: null,
      horaDesde: '',
      horaHasta: ''
    });
    this.paginator.pageIndex = 0;
    this.sort.active = 'fechaHoraSalida';
    this.sort.direction = 'asc';
    this.buscar();
  }

  crearViaje(): void {
    this.openAltaViajeDialog();
  }

  verDetallesViaje(v: ViajeDisponibleDto): void {
    this.viajeService.getDetalleViaje(v.id).then(detalle => {
      this.dialog.open(ViajeDetalleDialogComponent, {
        width: '1000px',
        maxHeight: '95vh',
        data: { viaje: detalle },
        disableClose: true
      }).afterClosed().subscribe(() => {
        this.buscar();
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

  private generateTimeOptions() {
    const options: { value: string, label: string }[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 5) {
        const hour = h.toString().padStart(2, '0');
        const minute = m.toString().padStart(2, '0');
        const time = `${hour}:${minute}`;
        options.push({ value: time, label: time });
      }
    }
    return options;
  }
}
