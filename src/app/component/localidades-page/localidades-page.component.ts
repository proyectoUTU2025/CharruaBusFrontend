import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AddLocalidadDialogComponent } from './dialogs/add-localidad-dialog/add-localidad-dialog.component';
import { BulkUploadLocalidadDialogComponent } from './dialogs/bulk-upload-localidad-dialog/bulk-upload-localidad-dialog.component';
import { BulkErrorsDialogComponent } from './dialogs/bulk-errors-dialog/bulk-errors-dialog.component';
import { LocalidadService } from '../../services/localidades.service';
import { LocalidadDto, FiltroBusquedaLocalidadDto, Page } from '../../models/localidades/localidades-dto.model';
import { BulkResponseDto } from '../../models/bulk/bulk-response.dto';
import { BulkLineResult } from '../../models/bulk/bulk-line-result.dto';

@Component({
  selector: 'app-localidades-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    AddLocalidadDialogComponent,
    BulkUploadLocalidadDialogComponent,
    BulkErrorsDialogComponent
  ],
  templateUrl: './localidades-page.component.html',
  styleUrls: ['./localidades-page.component.scss']
})
export class LocalidadesPageComponent implements OnInit, AfterViewInit {
  displayedColumns = ['id', 'departamento', 'nombre'];
  localidades: LocalidadDto[] = [];
  totalElements = 0;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private localidadService: LocalidadService
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => this.load());
    this.load();
  }

  openAltaMasivaDialog() {
    this.dialog.open(BulkUploadLocalidadDialogComponent, { width: '600px' })
      .afterClosed()
      .subscribe((file: File | undefined) => {
        if (file) {
          this.localidadService.bulkUpload(file)
            .subscribe((resp: BulkResponseDto) => {
              const errores = resp.results.filter((r: BulkLineResult) => !r.creado);
              if (errores.length > 0) {
                this.dialog.open(BulkErrorsDialogComponent, {
                  width: '600px',
                  data: errores
                });
              } else {
                this.load();
              }
            });
        }
      });
  }

  openAgregarDialog() {
    this.dialog.open(AddLocalidadDialogComponent, {
      width: '400px',
      maxHeight: '95vh'
    }).afterClosed().subscribe((localidad: LocalidadDto) => {
      if (localidad) {
        this.localidadService.create(localidad).subscribe(() => this.load());
      }
    });
  }

  private load() {
    const filtro: FiltroBusquedaLocalidadDto = {};
    const page = this.paginator?.pageIndex || 0;
    const size = this.paginator?.pageSize || 10;

    this.localidadService.getAll(filtro, page, size).subscribe((resp: Page<LocalidadDto>) => {
      this.localidades = resp.content;
      this.totalElements = resp.totalElements;
    });
  }
}
