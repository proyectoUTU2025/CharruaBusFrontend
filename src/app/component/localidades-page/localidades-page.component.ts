import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { AddLocalidadDialogComponent } from './dialogs/add-localidad-dialog/add-localidad-dialog.component';
import { EditLocalidadDialogComponent } from './dialogs/edit-localidad-dialog/edit-localidad-dialog.component';
import { ConfirmLocalidadDialogComponent } from './dialogs/confirm-localidad-dialog/confirm-localidad-dialog.component';
import { BulkUploadLocalidadDialogComponent } from './dialogs/bulk-upload-localidad-dialog/bulk-upload-localidad-dialog.component';

import { LocalidadService } from '../../services/localidades.service';
import { Localidad } from '../../models/localidades';

@Component({
  selector: 'app-localidades-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    AddLocalidadDialogComponent,
    EditLocalidadDialogComponent,
    ConfirmLocalidadDialogComponent,
    BulkUploadLocalidadDialogComponent
  ],
  templateUrl: './localidades-page.component.html',
  styleUrls: ['./localidades-page.component.scss']
})
export class LocalidadesPageComponent implements OnInit {
  displayedColumns = ['id', 'departamento', 'nombre', 'codigo', 'acciones'];
  dataSource = new MatTableDataSource<Localidad>();

  constructor(
    private dialog: MatDialog,
    private localidadService: LocalidadService
  ) {}

  ngOnInit() {
    this.load();
  }

  openAltaMasivaDialog() {
    this.dialog.open(BulkUploadLocalidadDialogComponent, { width: '600px' });
  }

  openAgregarDialog() {
    this.dialog.open(AddLocalidadDialogComponent, {
      width: '400px',
      maxHeight: '95vh'
    }).afterClosed().subscribe((localidad: Localidad) => {
      if (localidad) {
        this.localidadService.create(localidad).subscribe(() => this.load());
      }
    });
  }

  openEditarDialog(localidad: Localidad) {
    this.dialog.open(EditLocalidadDialogComponent, {
      width: '400px',
      data: localidad
    }).afterClosed().subscribe((updated: Localidad) => {
      if (updated) {
        this.localidadService.update(updated).subscribe(() => this.load());
      }
    });
  }

  openEliminarDialog(localidad: Localidad) {
    this.dialog.open(ConfirmLocalidadDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmar eliminación',
        message: `¿Eliminar localidad ${localidad.nombre}?`
      }
    }).afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        this.localidadService.delete(localidad.id).subscribe(() => this.load());
      }
    });
  }

  private load() {
    this.localidadService.getAll().subscribe((localidades: Localidad[]) => {
      this.dataSource.data = localidades;
    });
  }
}
