import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BusDto } from '../../models/buses/bus-dto.model';
import { Page } from '../../models/page.model';
import { BulkResponseDto } from '../../models/bulk/bulk-response.dto';
import { BulkLineResult } from '../../models/bulk/bulk-line-result.dto';
import { BusService } from '../../services/bus.service';

import { LocalidadService } from '../../services/localidades.service';
import { LocalidadDto } from '../../models/localidades/localidades-dto.model';

import { AddBusDialogComponent } from './dialogs/add-bus-dialog/add-bus-dialog.component';
import { BulkUploadBusDialogComponent } from './dialogs/bulk-upload-bus-dialog/bulk-upload-bus-dialog.component';
import { BulkErrorsDialogComponent } from './dialogs/bulk-errors-dialog/bulk-errors-dialog.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-buses-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
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
    AddBusDialogComponent,
    BulkUploadBusDialogComponent,
    BulkErrorsDialogComponent,
    ConfirmDialogComponent,
    MatTooltipModule
  ],
  templateUrl: './buses-page.component.html',
  styleUrls: ['./buses-page.component.scss']
})
export class BusesPageComponent implements OnInit, AfterViewInit {
  filterForm: FormGroup;
  dataSource = new MatTableDataSource<BusDto>();
  totalElements = 0;
  columns = ['id', 'matricula', 'capacidad', 'activo', 'acciones'];

  localidades: LocalidadDto[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private busService: BusService,
    private localidadService: LocalidadService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      matricula: [''],
      localidadId: [null],
      minAsientos: [null],
      maxAsientos: [null],
      activo: [null]
    });
  }

  ngOnInit() {
    this.localidadService.getAll({}, 0, 1000).subscribe({
      next: (page) => {
        this.localidades = page.content;
      },
      error: (err) => {
        console.error('Error cargando localidades:', err);
      }
    });
  }

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => this.loadBuses());
    this.loadBuses();
  }

  private loadBuses() {
    const filtro: any = this.filterForm.value;
    const page = this.paginator?.pageIndex || 0;
    const size = this.paginator?.pageSize || 5;

    this.busService.getAll(filtro, page, size)
      .then((resp: Page<BusDto>) => {
        this.dataSource.data = resp.content;
        this.totalElements = resp.totalElements;
      })
      .catch(error => {
        console.error('Error al traer ómnibus:', error);
      });
  }

  onSearch() {
    this.paginator.firstPage();
    this.loadBuses();
  }

  onClear() {
    this.filterForm.reset({
      matricula: '',
      localidadId: null,
      minAsientos: null,
      maxAsientos: null,
      activo: null
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
      width: '450px',
      maxHeight: '95vh'
    })
      .afterClosed()
      .subscribe((alta: any) => {
        if (alta) {
          this.busService.create(alta)
            .then(() => this.onSearch())
            .catch(console.error);
        }
      });
  }

  cambiarEstado(bus: BusDto) {
    const nuevoEstado = !bus.activo;
    const mensaje = nuevoEstado
      ? `¿Seguro que quieres ACTIVAR el ómnibus "${bus.matricula}"?`
      : `¿Seguro que quieres INACTIVAR el ómnibus "${bus.matricula}"?\nNo podrá asignarse a viajes futuros.`;

    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar cambio de estado',
        message: mensaje
      }
    }).afterClosed().subscribe(confirmado => {
      if (!confirmado) return;
      this.busService.cambiarEstado(bus.id, nuevoEstado)
        .then(res => {
          this.snackBar.open(res.message, 'Cerrar', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['custom-snackbar']
          });
          this.loadBuses();
        })
        .catch(err => {
          let msg = 'Error al cambiar estado';
          if (err?.error?.message) msg = err.error.message;
          this.snackBar.open(msg, 'Cerrar', {
            duration: 4000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['custom-snackbar']
          });
          this.loadBuses();
        });
    });
  }
}
