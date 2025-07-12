import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { MaterialUtilsService } from '../../shared/material-utils.service';
import { FiltroBusquedaBusDto, BusDto, Page } from '../../models';
import { BusService } from '../../services/bus.service';
import { AddBusDialogComponent } from './dialogs/add-bus-dialog/add-bus-dialog.component';
import { BulkUploadBusDialogComponent } from './dialogs/bulk-upload-bus-dialog/bulk-upload-bus-dialog.component';
import { BusDetailDialogComponent } from './dialogs/bus-detail-dialog/bus-detail-dialog.component';
import { LocalidadNombreDepartamentoDto } from '../../models/localidades/localidad-nombre-departamento-dto.model';
import { LocalidadService } from '../../services/localidades.service';
import { firstValueFrom, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-buses-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSortModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
    AddBusDialogComponent,
    BulkUploadBusDialogComponent,
    BusDetailDialogComponent,
    MatTooltipModule
  ],
  templateUrl: './buses-page.component.html',
  styleUrls: ['./buses-page.component.scss']
})
export class BusesPageComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  filterForm: FormGroup;
  buses: BusDto[] = [];
  totalElements = 0;
  pageIndex = 0;
  pageSize = 5;
  columns = ['id', 'matricula', 'capacidad','ubicacionActual', 'activo', 'acciones'];
  localidades: LocalidadNombreDepartamentoDto[] = [];
  isLoading = true;
  hasSearched = false;
  
  horasDisponibles = this.generateTimeOptions();

  constructor(
    private fb: FormBuilder,
    private busService: BusService,
    private dialog: MatDialog,
    private localidadesService: LocalidadService,
    private changeDetectorRef: ChangeDetectorRef,
    private materialUtils: MaterialUtilsService
  ) {
    this.filterForm = this.fb.group({
      matricula: [''],
      localidadId: [null],
      minAsientos: [null],
      maxAsientos: [null],
      activo: [null],
      fechaSalida: [null],
      horaSalida: [''],
      fechaLlegada: [null],
      horaLlegada: ['']
    });
  }

  get fechaSalida(): Date | null {
    return this.filterForm.get('fechaSalida')?.value;
  }

  private generateTimeOptions() {
    const options = [];
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

  async ngOnInit() { 
    this.localidades = await firstValueFrom(this.localidadesService.getAllFlat());
    this.subscribeToDateChanges();
  }

  private subscribeToDateChanges(): void {
    this.filterForm.get('fechaSalida')?.valueChanges.subscribe(value => {
      const fechaLlegadaControl = this.filterForm.get('fechaLlegada');
      if (value && fechaLlegadaControl?.value && new Date(value) > new Date(fechaLlegadaControl.value)) {
        fechaLlegadaControl.setValue(null);
      }
    });
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadBuses())
      )
      .subscribe();

    this.loadBuses();
  }
  
  private loadBuses() {
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
    
    const filtro: FiltroBusquedaBusDto = {
      matricula: f.matricula,
      localidadId: f.localidadId ?? undefined,
      minAsientos: f.minAsientos ?? undefined,
      maxAsientos: f.maxAsientos ?? undefined,
      activo: f.activo ?? undefined,
      fechaHoraSalida: buildDateTime(f.fechaSalida, f.horaSalida),
      fechaHoraLlegada: buildDateTime(f.fechaLlegada, f.horaLlegada)
    };

    const sortActive = this.sort?.active || 'matricula';
    const sortDirection = this.sort?.direction || 'asc';
    const backendField = sortActive === 'capacidad' ? 'cantidadAsientos' : sortActive;
    const sortParam = `${backendField},${sortDirection}`;
    
    const pageIndex = this.paginator?.pageIndex || 0;
    const pageSize = this.paginator?.pageSize || 5;
    
    this.busService.getAll(filtro, pageIndex, pageSize, sortParam)
      .then((res: Page<BusDto>) => {
        this.buses = res.content || [];
        this.totalElements = res.page?.totalElements || 0;
        this.pageIndex = res.page?.number || 0;
        this.pageSize = res.page?.size || this.pageSize;
      })
      .catch((error) => {
        console.error('Error al cargar datos:', error);
        this.materialUtils.showError('Error al cargar los datos. Por favor, intenta nuevamente.');
        this.buses = [];
        this.totalElements = 0;
      })
      .finally(() => {
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      });
  }

  onSearch() {
    const f = this.filterForm.value;
    
    if (f.minAsientos !== null && f.maxAsientos !== null) {
      if (f.minAsientos > f.maxAsientos) {
        this.materialUtils.showError('El mínimo de asientos no puede ser mayor que el máximo.');
        return;
      }
    }
    
    if (f.minAsientos !== null && f.minAsientos < 0) {
      this.materialUtils.showError('El mínimo de asientos no puede ser negativo.');
      return;
    }
    
    if (f.maxAsientos !== null && f.maxAsientos < 0) {
      this.materialUtils.showError('El máximo de asientos no puede ser negativo.');
      return;
    }
    
    const tieneFechaSalida = f.fechaSalida !== null;
    const tieneFechaLlegada = f.fechaLlegada !== null;
    
    if (tieneFechaSalida !== tieneFechaLlegada) {
      this.materialUtils.showError('Si especificas fecha de salida, también debes especificar fecha de llegada y viceversa.');
      return;
    }
    
    if (tieneFechaSalida && tieneFechaLlegada) {
      const fechaSalida = new Date(f.fechaSalida);
      const fechaLlegada = new Date(f.fechaLlegada);
      
      fechaSalida.setHours(0, 0, 0, 0);
      fechaLlegada.setHours(0, 0, 0, 0);

      if (f.horaSalida) {
        const [hSalida, mSalida] = f.horaSalida.split(':').map(Number);
        fechaSalida.setHours(hSalida, mSalida);
      }
      if (f.horaLlegada) {
        const [hLlegada, mLlegada] = f.horaLlegada.split(':').map(Number);
        fechaLlegada.setHours(hLlegada, mLlegada);
      }
      
      if (fechaLlegada <= fechaSalida) {
        this.materialUtils.showError('La fecha/hora de llegada debe ser posterior a la fecha/hora de salida.');
        return;
      }
    }
    
    const tieneFechas = tieneFechaSalida && tieneFechaLlegada;
    const tieneLocalidad = f.localidadId && f.localidadId !== null;
    
    if (tieneFechas && !tieneLocalidad) {
      this.materialUtils.showError('Si especificas fechas, también debes especificar una ubicación.');
      return;
    }
    
    if (tieneLocalidad && !tieneFechas) {
      this.materialUtils.showError('Si especificas una ubicación, también debes especificar un rango de fechas.');
      return;
    }

    this.paginator.pageIndex = 0;
    this.loadBuses();
  }

  onClear() {
    this.filterForm.reset({
      matricula: '', 
      localidadId: null,
      minAsientos: null, 
      maxAsientos: null,
      activo: null,
      fechaSalida: null,
      horaSalida: '',
      fechaLlegada: null,
      horaLlegada: ''
    });
    this.paginator.pageIndex = 0;
    
    if (this.sort) {
      this.sort.active = 'matricula';
      this.sort.direction = 'asc';
    }

    this.loadBuses();
  }

  openBulkUpload() {
    const dialogRef = this.dialog.open(BulkUploadBusDialogComponent, { 
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.materialUtils.showSuccess('Carga masiva completada con éxito.');
        this.loadBuses();
      }
    });
  }

  add() {
    this.dialog.open(AddBusDialogComponent, {
      width: '450px', maxHeight: '95vh',
      disableClose: true
    })
      .afterClosed()
      .subscribe((result: boolean | undefined) => {
        if (result) {
          this.materialUtils.showSuccess('Ómnibus creado exitosamente.');
          this.loadBuses();
        }
      });
  }

   toggleActive(bus: BusDto) {
    const action = bus.activo ? 'desactivar' : 'activar';
    const actionPast = bus.activo ? 'desactivado' : 'activado';
    
    const newActive = !bus.activo;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Confirmar cambio de estado`,
        message: `¿Estás seguro de que deseas ${bus.activo ? 'desactivar' : 'activar'} el ómnibus con matrícula ${bus.matricula}?`,
        type: bus.activo ? 'warning' : 'info'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.busService.cambiarEstado(bus.id, newActive)
          .then(() => {
            this.materialUtils.showSuccess(`Ómnibus ${bus.activo ? 'desactivado' : 'activado'} correctamente.`);
            this.loadBuses();
          })
          .catch((err: any) => {
            this.materialUtils.showError(err.error?.message || `Error al ${action} el ómnibus.`);
          });
      }
    });
  }

  localidadNombre(id: number): string {
    return this.localidades.find(l => l.id === id)?.nombreConDepartamento ?? 'Desconocido';
  }

  goToBusDetail(bus: BusDto) {
    const dialogRef = this.dialog.open(BusDetailDialogComponent, {
      width: '90vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      data: { busId: bus.id },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadBuses();
    });
  }
}
