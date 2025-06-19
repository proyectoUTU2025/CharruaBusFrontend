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
import { Configuracion } from '../../models/configuracion';
import { ConfiguracionDelSistemaService } from '../../services/configuracion-del-sistema.service';
import { EditConfiguracionDialogComponent } from './dialogs/edit-configuracion-dialog.component';

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
        EditConfiguracionDialogComponent
    ]
})
export class ConfiguracionDelSistemaComponent implements OnInit {
    displayedColumns = ['id', 'nombre', 'valorInt', 'valor', 'acciones'];
    dataSource = new MatTableDataSource<Configuracion>();


    totalElements = 0;
    pageSize = 20;
    currentPage = 0;

    filtroNombre: string = '';

    constructor(
        private service: ConfiguracionDelSistemaService,
        private dialog: MatDialog
    ) { }

    ngOnInit() {
        this.load();
    }

    load(page = 0, size = 20) {
        this.service.list(this.filtroNombre?.trim() || undefined, page, size).subscribe(pageData => {
            this.dataSource.data = pageData.content;
            this.totalElements = pageData.totalElements;
            this.pageSize = size;
            this.currentPage = page;
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

    edit(conf: Configuracion) {
        const ref = this.dialog.open(EditConfiguracionDialogComponent, {
            width: '400px',
            data: conf
        });
        ref.afterClosed().subscribe((updated: Configuracion) => {
            if (updated) {
                this.service.update(updated).subscribe(() => this.load(this.currentPage, this.pageSize));
            }
        });
    }
}
