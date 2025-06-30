import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { SharedModule } from '../../shared/shared.module';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

import { LocalidadService } from '../../services/localidades.service';
import { LocalidadDto, FiltroBusquedaLocalidadDto } from '../../models/localidades/localidades-dto.model';
import { Page } from '../../models';
import { BulkResponseDto } from '../../models/bulk/bulk-response.dto';
import { BulkLineResult } from '../../models/bulk/bulk-line-result.dto';
import { AddLocalidadDialogComponent } from './dialogs/add-localidad-dialog/add-localidad-dialog.component';
import { BulkUploadLocalidadDialogComponent } from './dialogs/bulk-upload-localidad-dialog/bulk-upload-localidad-dialog.component';
import { BulkErrorsDialogComponent } from './dialogs/bulk-errors-dialog/bulk-errors-dialog.component';
import { TipoDepartamento } from '../../models/localidades/tipo-departamento.enum';
import { MaterialUtilsService } from '../../shared/material-utils.service';

@Component({
  selector: 'app-localidades-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSortModule,
    AddLocalidadDialogComponent,
    BulkUploadLocalidadDialogComponent,
    BulkErrorsDialogComponent,
    SharedModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './localidades-page.component.html',
  styleUrls: ['./localidades-page.component.scss']
})
export class LocalidadesPageComponent implements OnInit {
  displayedColumns = ['id', 'departamento', 'nombre'];
  filterForm!: FormGroup;
  departamentos: { value: string; viewValue: string }[] = [];
  localidades: LocalidadDto[] = [];
  totalElements = 0;
  pageIndex = 0;
  pageSize = 10;
  isLoading = false;
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
    private dialog: MatDialog,
    private localidadService: LocalidadService,
    private materialUtils: MaterialUtilsService
  ) {}

  ngOnInit(): void {
    this.departamentos = Object.keys(TipoDepartamento).map(key => ({
      value: key,
      viewValue: this.formatDepartmentName(TipoDepartamento[key as keyof typeof TipoDepartamento])
    }));

    this.filterForm = this.fb.group({
      departamentos: [null],
      nombre: [''],
    });
    this.buscar();
  }

  private formatDepartmentName(departmentValue: string): string {
    return departmentValue.replace(/_/g, ' ');
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

    const filtro: FiltroBusquedaLocalidadDto = {
      nombre: this.filterForm.get('nombre')?.value || undefined,
      departamentos: this.filterForm.get('departamentos')?.value ? [this.filterForm.get('departamentos')?.value] : undefined,
    };

    let sortParam = 'nombre,asc';
    const activeField = sortEvent?.active || this.sort?.active;
    const direction = sortEvent?.direction || this.sort?.direction;
    if (activeField && direction) {
      sortParam = `${activeField},${direction}`;
    }

    console.log('Sort param enviado al backend:', sortParam);

    this.localidadService
      .getAll(filtro, this.pageIndex, this.pageSize, sortParam)
      .subscribe({
        next: (page) => {
          this.localidades = page.content;
          this.totalElements = page.page.totalElements;
        },
        error: () => {
          this.materialUtils.showError('Error al cargar las localidades');
        },
        complete: () => {
          if (!isSortRequest) {
            this.isLoading = false;
          }
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
    this.filterForm.reset({ departamentos: null, nombre: '' });
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.buscar(this.getCurrentSort());
  }

  cambiarPagina(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.buscar(this.getCurrentSort());
  }

  openAltaMasivaDialog() {
    this.dialog.open(BulkUploadLocalidadDialogComponent)
      .afterClosed()
      .subscribe(result => {
        if (result?.errors) {
          this.dialog.open(BulkErrorsDialogComponent, { data: { results: result.errors } });
        } else if (result?.success) {
          this.buscar(this.getCurrentSort());
        }
      });
  }

  openAgregarDialog() {
    const dialogRef = this.dialog.open(AddLocalidadDialogComponent, { width: '400px', maxHeight: '95vh' });
    
    dialogRef.afterClosed().subscribe(loc => {
      if (!loc) return;
      this.buscar(this.getCurrentSort());
    });
  }
}
