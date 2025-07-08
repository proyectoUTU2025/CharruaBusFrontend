import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

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
export class LocalidadesPageComponent implements OnInit, AfterViewInit {
  displayedColumns = ['id', 'departamento', 'nombre'];
  filterForm!: FormGroup;
  departamentos: { value: string; viewValue: string }[] = [];
  localidades: LocalidadDto[] = [];
  totalElements = 0;
  isLoading = true;
  hasSearched = false;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

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
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.buscar())
      )
      .subscribe();

    this.buscar();
  }

  formatDepartmentName(departmentValue: string): string {
    return departmentValue.replace(/_/g, ' ');
  }

  buscar(): void {
    this.isLoading = true;
    this.hasSearched = true;

    const filtro: FiltroBusquedaLocalidadDto = {
      nombre: this.filterForm.get('nombre')?.value || undefined,
      departamentos: this.filterForm.get('departamentos')?.value ? [this.filterForm.get('departamentos')?.value] : undefined,
    };

    const sortActive = this.sort?.active || 'nombre';
    const sortDirection = this.sort?.direction || 'asc';
    const sortParam = `${sortActive},${sortDirection}`;
    
    const pageIndex = this.paginator?.pageIndex || 0;
    const pageSize = this.paginator?.pageSize || 10;

    this.localidadService
      .getAll(filtro, pageIndex, pageSize, sortParam)
      .subscribe({
        next: (page) => {
          this.localidades = page.content;
          this.totalElements = page.page.totalElements;
        },
        error: () => {
          this.materialUtils.showError('Error al cargar las localidades');
          this.localidades = [];
          this.totalElements = 0;
        },
        complete: () => {
          this.isLoading = false;
        }
    });
  }

  onSearch(): void {
    this.paginator.pageIndex = 0;
    this.buscar();
  }

  onClear(): void {
    this.filterForm.reset({ departamentos: null, nombre: '' });
    this.paginator.pageIndex = 0;
    this.sort.active = 'nombre';
    this.sort.direction = 'asc';
    this.buscar();
  }

  openAltaMasivaDialog() {
    this.dialog.open(BulkUploadLocalidadDialogComponent, {
      disableClose: true
    })
      .afterClosed()
      .subscribe(result => {
        if (result?.errors) {
          this.dialog.open(BulkErrorsDialogComponent, { data: { results: result.errors } });
        } else if (result?.success) {
          this.buscar();
        }
      });
  }

  openAgregarDialog() {
    const dialogRef = this.dialog.open(AddLocalidadDialogComponent, { 
      width: '400px', 
      maxHeight: '95vh',
      disableClose: true
    });
    
    dialogRef.afterClosed().subscribe(loc => {
      if (!loc) return;
      this.buscar();
    });
  }
}
