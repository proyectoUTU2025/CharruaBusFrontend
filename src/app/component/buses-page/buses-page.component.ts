import { Router } from '@angular/router';
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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { MaterialUtilsService } from '../../shared/material-utils.service';
import { FiltroBusquedaBusDto, BusDto, Page } from '../../models';
import { BusService } from '../../services/bus.service';
import { AddBusDialogComponent } from './dialogs/add-bus-dialog/add-bus-dialog.component';
import { BulkUploadBusDialogComponent } from './dialogs/bulk-upload-bus-dialog/bulk-upload-bus-dialog.component';
import { LocalidadNombreDepartamentoDto } from '../../models/localidades/localidad-nombre-departamento-dto.model';
import { LocalidadService } from '../../services/localidades.service';
import { firstValueFrom } from 'rxjs';


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
    MatDialogModule,
    MatCardModule,
    MatSortModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    LoadingSpinnerComponent,
    AddBusDialogComponent,
    BulkUploadBusDialogComponent
  ],
  templateUrl: './buses-page.component.html',
  styleUrls: ['./buses-page.component.scss']
})
export class BusesPageComponent implements OnInit {
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
        this.loadBuses(event);
      });
    }
  }

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
    private router: Router,
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
    // Cargar datos iniciales sin filtros
    this.loadInitialData();
  }

  private getCurrentSort(): Sort | undefined {
    return this.sort?.active && this.sort?.direction ? 
      { active: this.sort.active, direction: this.sort.direction } as Sort : 
      undefined;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    // Solo recargar si ya se hizo una búsqueda previa
    if (this.hasSearched) {
      this.loadBuses(this.getCurrentSort());
    }
  }

  loadInitialData() {
    // Cargar datos iniciales sin filtros
    this.isLoading = true;
    const filtro: FiltroBusquedaBusDto = {};
    
    this.busService.getAll(filtro, 0, this.pageSize, 'matricula,asc')
      .then((res: Page<BusDto>) => {
        console.log('Respuesta del backend:', res); // Debug
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

  private loadBuses(sortEvent?: Sort) {
    const isSortRequest = !!sortEvent;
    if (!isSortRequest) {
      this.isLoading = true;
    }
    this.hasSearched = true;
    const f = this.filterForm.value;
    
    // Función para combinar fecha y hora (manteniendo zona horaria local)
    const buildDateTime = (fecha: Date | null, hora: string): string | undefined => {
      if (!fecha) return undefined;
      
      // Si no hay hora especificada, usar 00:00 por defecto
      const timeToUse = hora || '00:00';
      const [hh, mm] = timeToUse.split(':').map(Number);
      const dt = new Date(fecha);
      dt.setHours(hh, mm, 0, 0);
      
      // Formatear como YYYY-MM-DDTHH:mm:ss sin conversión de zona horaria
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

    let sortParam = 'matricula,asc';
    const activeField = sortEvent?.active || this.sort?.active;
    const direction = sortEvent?.direction || this.sort?.direction;
    if (activeField && direction) {
      // Mapear "capacidad" a "cantidadAsientos" para el backend
      const backendField = activeField === 'capacidad' ? 'cantidadAsientos' : activeField;
      sortParam = `${backendField},${direction.toUpperCase()}`;
    }

    console.log('Sort param enviado al backend:', sortParam);
    
    this.busService.getAll(filtro, this.pageIndex, this.pageSize, sortParam)
      .then((res: Page<BusDto>) => {
        console.log('Respuesta del backend:', res); // Debug
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
        if (!isSortRequest) {
          this.isLoading = false;
        }
        this.changeDetectorRef.detectChanges();
      });
  }

  onSearch() {
    const f = this.filterForm.value;
    
    // 1. Validaciones de asientos
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
    
    // 2. Validaciones de fechas
    const tieneFechaSalida = f.fechaSalida !== null;
    const tieneFechaLlegada = f.fechaLlegada !== null;
    
    // Ambas fechas deben estar presentes o ambas ausentes
    if (tieneFechaSalida !== tieneFechaLlegada) {
      this.materialUtils.showError('Si especificas fecha de salida, también debes especificar fecha de llegada y viceversa.');
      return;
    }
    
    // Si hay ambas fechas, validar orden temporal
    if (tieneFechaSalida && tieneFechaLlegada) {
      const fechaSalida = new Date(f.fechaSalida);
      const fechaLlegada = new Date(f.fechaLlegada);
      
      // Aplicar horas específicas si están presentes
      if (f.horaSalida && f.horaLlegada) {
        const [hSalida, mSalida] = f.horaSalida.split(':').map(Number);
        const [hLlegada, mLlegada] = f.horaLlegada.split(':').map(Number);
        
        fechaSalida.setHours(hSalida, mSalida, 0, 0);
        fechaLlegada.setHours(hLlegada, mLlegada, 0, 0);
      }
      
      if (fechaLlegada <= fechaSalida) {
        this.materialUtils.showError('La fecha/hora de llegada debe ser posterior a la fecha/hora de salida.');
        return;
      }
    }
    
    // 3. Validaciones de dependencias: Fechas ↔ Ubicación
    const tieneFechas = tieneFechaSalida && tieneFechaLlegada;
    const tieneLocalidad = f.localidadId && f.localidadId !== null;
    
    if (tieneFechas && !tieneLocalidad) {
      this.materialUtils.showError('Si especificas fechas de salida y llegada, también debes seleccionar una ubicación del ómnibus.');
      return;
    }
    
    if (tieneLocalidad && !tieneFechas) {
      this.materialUtils.showError('Si especificas una ubicación del ómnibus, también debes especificar las fechas de salida y llegada.');
      return;
    }
    
    // 4. Todas las validaciones pasaron - proceder con la búsqueda
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadBuses(this.getCurrentSort());
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
    this.onSearch();
  }

  openBulkUpload() {
    const dialogRef = this.dialog.open(BulkUploadBusDialogComponent, { 
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBuses(this.getCurrentSort());
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
          this.onSearch();
        }
      });
  }

  toggleActive(bus: BusDto) {
    this.busService.cambiarEstado(bus.id, !bus.activo)
      .then(() => this.loadBuses(this.getCurrentSort()))
      .catch(console.error);
  }
  localidadNombre(id: number): string {
    return this.localidades.find(l => l.id === id)?.nombreConDepartamento ?? 'Desconocido';
  }

  goToBusDetail(bus: BusDto) {
    this.router.navigate(['/omnibus', bus.id]);
  }


}
