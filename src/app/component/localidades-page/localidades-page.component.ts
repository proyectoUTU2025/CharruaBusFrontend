import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
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

import { LocalidadService } from '../../services/localidades.service';
import { LocalidadDto, FiltroBusquedaLocalidadDto } from '../../models/localidades/localidades-dto.model';
import { Page } from '../../models';
import { BulkResponseDto } from '../../models/bulk/bulk-response.dto';
import { BulkLineResult } from '../../models/bulk/bulk-line-result.dto';
import { AddLocalidadDialogComponent } from './dialogs/add-localidad-dialog/add-localidad-dialog.component';
import { BulkUploadLocalidadDialogComponent } from './dialogs/bulk-upload-localidad-dialog/bulk-upload-localidad-dialog.component';
import { BulkErrorsDialogComponent } from './dialogs/bulk-errors-dialog/bulk-errors-dialog.component';

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
    AddLocalidadDialogComponent,
    BulkUploadLocalidadDialogComponent,
    BulkErrorsDialogComponent,
  ],
  templateUrl: './localidades-page.component.html',
  styleUrls: ['./localidades-page.component.scss']
})
export class LocalidadesPageComponent implements OnInit, AfterViewInit {
  displayedColumns = ['id', 'departamento', 'nombre'];
  filterForm!: FormGroup;
  departamentos: string[] = [];
  localidades: LocalidadDto[] = [];
  totalElements = 0;
  pageIndex = 0;
  pageSize = 5;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private localidadService: LocalidadService
  ) {}

  ngOnInit() {
    this.filterForm = this.fb.group({
      departamentos: [null],
      nombre: ['']
    });
    this.localidadService.getAllFlat().subscribe(all => {
      this.departamentos = Array.from(new Set(
        all.map(x => x.nombreConDepartamento.split(' - ')[0])
      ));
    });
  }

  ngAfterViewInit() {
    this.paginator.page.subscribe((e: PageEvent) =>
      this.load(e.pageIndex, e.pageSize)
    );
    this.load(0, this.pageSize);
  }

  buscar() {
    this.paginator.firstPage();
    this.load(0, this.pageSize);
  }

  limpiar() {
    this.filterForm.reset({ departamentos: null, nombre: '' });
    this.buscar();
  }

  cambiarPagina(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load(this.pageIndex, this.pageSize);
  }

  private load(page: number, size: number) {
    const deps = this.filterForm.value.departamentos;
    const nom = this.filterForm.value.nombre?.trim();

    const filtro: FiltroBusquedaLocalidadDto = {
      ...(deps ? { departamentos: [deps] } : {}),
      ...(nom  ? { nombre: nom }        : {})
    };

    this.localidadService.getAll(filtro, page, size)
      .subscribe((resp: Page<LocalidadDto>) => {
        this.localidades   = resp.content;
        this.totalElements = resp.page.totalElements;
        this.pageIndex     = resp.page.number;
      });
  }

  openAltaMasivaDialog() {
    this.dialog.open(BulkUploadLocalidadDialogComponent, { width: '600px' })
      .afterClosed()
      .subscribe(file => {
        if (!file) return;
        this.localidadService.bulkUpload(file)
          .subscribe((resp: BulkResponseDto) => {
            const errores = resp.results.filter(r => !r.creado);
            if (errores.length) {
              this.dialog.open(BulkErrorsDialogComponent, { width: '600px', data: errores });
            } else {
              this.load(this.pageIndex, this.pageSize);
            }
          });
      });
  }

  openAgregarDialog() {
    this.dialog.open(AddLocalidadDialogComponent, { width: '400px', maxHeight: '95vh' })
      .afterClosed()
      .subscribe(loc => {
        if (!loc) return;
        this.localidadService.create(loc)
          .subscribe(() => this.load(this.pageIndex, this.pageSize));
      });
  }
}
