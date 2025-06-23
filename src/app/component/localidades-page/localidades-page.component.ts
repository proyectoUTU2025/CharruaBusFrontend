import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AddLocalidadDialogComponent } from './dialogs/add-localidad-dialog/add-localidad-dialog.component';
import { BulkUploadLocalidadDialogComponent } from './dialogs/bulk-upload-localidad-dialog/bulk-upload-localidad-dialog.component';
import { BulkErrorsDialogComponent } from './dialogs/bulk-errors-dialog/bulk-errors-dialog.component';
import { LocalidadService } from '../../services/localidades.service';
import { LocalidadDto, FiltroBusquedaLocalidadDto } from '../../models/localidades/localidades-dto.model';
import { Page } from '../../models';
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
    this.paginator.page.subscribe((e: PageEvent) => this.load(e.pageIndex, e.pageSize));
    this.load(this.paginator.pageIndex, this.paginator.pageSize);
  }

  openAltaMasivaDialog() {
    this.dialog.open(BulkUploadLocalidadDialogComponent, { width: '600px' })
      .afterClosed()
      .subscribe((file: File | undefined) => {
        if (!file) return;
        this.localidadService.bulkUpload(file)
          .subscribe((resp: BulkResponseDto) => {
            const errores = resp.results.filter((r: BulkLineResult) => !r.creado);
            if (errores.length) {
              this.dialog.open(BulkErrorsDialogComponent, {
                width: '600px',
                data: errores
              });
            } else {
              this.load(this.paginator.pageIndex, this.paginator.pageSize);
            }
          });
      });
  }

  openAgregarDialog() {
    this.dialog.open(AddLocalidadDialogComponent, {
      width: '400px',
      maxHeight: '95vh'
    }).afterClosed().subscribe((loc: LocalidadDto) => {
      if (!loc) return;
      this.localidadService.create(loc)
        .subscribe(() => this.load(this.paginator.pageIndex, this.paginator.pageSize));
    });
  }

  private load(page: number, size: number) {
    const filtro: FiltroBusquedaLocalidadDto = {};
    this.localidadService.getAll(filtro, page, size)
      .subscribe((resp: Page<LocalidadDto>) => {
        this.localidades = resp.content;
        this.totalElements = resp.page.totalElements;
      });
  }
}
