import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AltaBusDto, FiltroBusquedaBusDto, BusDto, Page } from '../../models';
import { BulkResponseDto } from '../../models/bulk/bulk-response.dto';
import { BulkLineResult } from '../../models/bulk/bulk-line-result.dto';
import { BusService } from '../../services/bus.service';
import { AddBusDialogComponent } from './dialogs/add-bus-dialog/add-bus-dialog.component';
import { BulkUploadBusDialogComponent } from './dialogs/bulk-upload-bus-dialog/bulk-upload-bus-dialog.component';
import { BulkErrorsDialogComponent } from './dialogs/bulk-errors-dialog/bulk-errors-dialog.component';
import { MatCardModule } from '@angular/material/card';

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
    AddBusDialogComponent,
    BulkUploadBusDialogComponent,
    BulkErrorsDialogComponent,
    MatCardModule
  ],
  templateUrl: './buses-page.component.html',
  styleUrls: ['./buses-page.component.scss']
})
export class BusesPageComponent implements OnInit, AfterViewInit {
  filterForm: FormGroup;
  buses: BusDto[] = [];
  totalElements = 0;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  columns = ['id', 'matricula', 'ubicacionActual', 'capacidad', 'activo', 'acciones'];

  constructor(
    private fb: FormBuilder,
    private busService: BusService,
    private dialog: MatDialog
  ) {
    this.filterForm = this.fb.group({
      matricula: [''],
      localidadId: [null],
      minAsientos: [null],
      maxAsientos: [null],
      activo: [null]
    });
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => this.loadBuses());
    this.loadBuses();
  }

  private loadBuses() {
    const filtro: FiltroBusquedaBusDto = this.filterForm.value;
    const page = this.paginator?.pageIndex || 0;
    const size = this.paginator?.pageSize || 5;

    this.busService.getAll(filtro, page, size)
      .then((resp: Page<BusDto>) => {
        this.buses = resp.content;
        this.totalElements = resp.totalElements;
      })
      .catch(console.error);
  }

  onSearch() {
    this.paginator.firstPage();
    this.loadBuses();
  }

  onClear() {
    this.filterForm.reset({
      matricula: '', localidadId: null, minAsientos: null, maxAsientos: null, activo: null
    });
    this.onSearch();
  }

  openBulkUpload() {
    this.dialog.open(BulkUploadBusDialogComponent, { width: '600px' })
      .afterClosed()
      .subscribe((file: File | undefined) => {
        if (file) {
          this.busService.bulkUpload(file)
            .then((resp: BulkResponseDto) => {
              const errores = resp.results.filter((r: BulkLineResult) => !r.creado);
              if (errores.length > 0) {
                this.dialog.open(BulkErrorsDialogComponent, {
                  width: '600px',
                  data: errores
                });
              } else {
                this.loadBuses();
              }
            })
            .catch(console.error);
        }
      });
  }

  add() {
    this.dialog.open(AddBusDialogComponent, {
      width: '450px', maxHeight: '95vh'
    })
    .afterClosed()
    .subscribe((alta: AltaBusDto) => {
      if (alta) {
        this.busService.create(alta)
          .then(() => this.onSearch())
          .catch(console.error);
      }
    });
  }
}
