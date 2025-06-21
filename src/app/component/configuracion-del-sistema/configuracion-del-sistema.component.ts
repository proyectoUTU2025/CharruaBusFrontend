import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Configuracion } from '../../models/configuracion';
import { ConfiguracionDelSistemaService } from '../../services/configuracion-del-sistema.service';
import { EditConfiguracionDialogComponent } from './dialogs/edit-configuracion-dialog.component';
import { CreateConfiguracionDialogComponent } from './dialogs/create-configuracion-dialog/create-configuracion-dialog.component';

@Component({
    standalone: true,
    selector: 'app-configuracion-del-sistema',
    templateUrl: './configuracion-del-sistema.component.html',
    styleUrls: ['./configuracion-del-sistema.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatInputModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
    ]
})
export class ConfiguracionDelSistemaComponent implements OnInit {
    displayedColumns = ['id', 'nombre', 'valorInt', 'valor', 'acciones'];
    dataSource = new MatTableDataSource<Configuracion>();
    totalElements = 0;
    pageSize = 20;
    currentPage = 0;
    filtroNombre = '';
    isLoading = false;

    constructor(
        private service: ConfiguracionDelSistemaService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.load();
    }

    load(page = 0, size = 20) {
        this.isLoading = true;
        this.service.list(this.filtroNombre.trim() || undefined, page, size).subscribe({
            next: pageData => {
                this.dataSource.data = pageData.content;
                this.totalElements = pageData.totalElements;
                this.pageSize = size;
                this.currentPage = page;
            },
            error: () => {
                this.snackBar.open('Error al cargar configuraciones', 'Cerrar', { duration: 3000 });
            },
            complete: () => {
                this.isLoading = false;
            }
        });
    }

    aplicarFiltro() {
        this.load(0, this.pageSize);
    }

    limpiarFiltro() {
        this.filtroNombre = '';
        this.load(0, this.pageSize);
    }

    pageChange(event: PageEvent) {
        this.load(event.pageIndex, event.pageSize);
    }

    create() {
        const ref = this.dialog.open(CreateConfiguracionDialogComponent, {
            width: '400px'
        });
        ref.afterClosed().subscribe((dto) => {
            if (dto) {
                this.service.create(dto).subscribe({
                    next: () => {
                        this.snackBar.open('Configuración creada', 'Cerrar', { duration: 3000 });
                        this.load(this.currentPage, this.pageSize);
                    },
                    error: () => {
                        this.snackBar.open('Error al crear configuración', 'Cerrar', { duration: 3000 });
                    }
                });
            }
        });
    }

    edit(conf: Configuracion) {
        const ref = this.dialog.open(EditConfiguracionDialogComponent, {
            width: '400px',
            data: conf
        });
        ref.afterClosed().subscribe((updated: Configuracion) => {
            if (updated) {
                this.service.update(updated).subscribe({
                    next: () => {
                        this.snackBar.open('Configuración actualizada', 'Cerrar', { duration: 3000 });
                        this.load(this.currentPage, this.pageSize);
                    },
                    error: () => {
                        this.snackBar.open('Error al actualizar configuración', 'Cerrar', { duration: 3000 });
                    }
                });
            }
        });
    }

    delete(conf: Configuracion) {
        if (confirm(`¿Eliminar configuración "${conf.nombre}"?`)) {
            this.service.delete(conf.id).subscribe({
                next: () => {
                    this.snackBar.open('Configuración eliminada', 'Cerrar', { duration: 3000 });
                    this.load(this.currentPage, this.pageSize);
                },
                error: () => {
                    this.snackBar.open('Error al eliminar configuración', 'Cerrar', { duration: 3000 });
                }
            });
        }
    }
}
