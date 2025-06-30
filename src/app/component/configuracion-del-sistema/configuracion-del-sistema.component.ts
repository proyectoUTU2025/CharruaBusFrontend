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
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { MaterialUtilsService } from '../../shared/material-utils.service';

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
        LoadingSpinnerComponent,
    ]
})
export class ConfiguracionDelSistemaComponent implements OnInit {
    displayedColumns = ['id', 'nombre', 'valorInt', 'valor', 'acciones'];
    dataSource = new MatTableDataSource<Configuracion>();
    totalElements = 0;
    pageSize = 10;
    currentPage = 0;
    filtroNombre = '';
    isLoading = false;
    hasSearched = false;

    constructor(
        private service: ConfiguracionDelSistemaService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private materialUtils: MaterialUtilsService
    ) { }

    ngOnInit() {
        this.load();
    }

    load(page = 0, size = 10) {
        this.isLoading = true;
        this.hasSearched = true;
        this.service.list(this.filtroNombre.trim() || undefined, page, size).subscribe({
            next: pageData => {
                this.dataSource.data = pageData.content;
                this.totalElements = pageData.page.totalElements;
                this.pageSize = size;
                this.currentPage = page;
            },
            error: () => {
                this.materialUtils.showError('Error al cargar configuraciones');
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
        ref.afterClosed().subscribe((success) => {
            if (success) {
                this.load(this.currentPage, this.pageSize);
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
                        this.materialUtils.showSuccess('Configuración actualizada');
                        this.load(this.currentPage, this.pageSize);
                    },
                    error: () => {
                        this.materialUtils.showError('Error al actualizar configuración');
                    }
                });
            }
        });
    }

    delete(conf: Configuracion) {
        const ref = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Confirmar Eliminación',
                message: `¿Está seguro de que desea eliminar la configuración "${conf.nombre}"?`,
                confirmText: 'Eliminar',
                cancelText: 'Cancelar',
                type: 'warning'
            },
            width: '400px'
        });
        ref.afterClosed().subscribe(confirmed => {
            if (confirmed) {
                this.service.delete(conf.id).subscribe({
                    next: () => {
                        this.materialUtils.showSuccess('Configuración eliminada');
                        this.load(this.currentPage, this.pageSize);
                    },
                    error: () => {
                        this.materialUtils.showError('Error al eliminar configuración');
                    }
                });
            }
        });
    }
}
