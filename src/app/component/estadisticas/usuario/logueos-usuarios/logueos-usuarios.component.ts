import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EstadisticaService } from '../../../../services/estadistica-usuario.service';
import { EstadisticaLogueos } from '../../../../models/estadisticas/usuario/estadistica-logueos';

@Component({
    selector: 'app-logueos-usuarios',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './logueos-usuarios.component.html',
    styleUrls: ['./logueos-usuarios.component.scss']
})
export class LogueosUsuariosComponent implements OnInit {
    data: EstadisticaLogueos[] = [];
    total = 0;
    pageSize = 10;
    pageIndex = 0;
    fechaInicio = '';
    fechaFin = '';
    isExporting = false;

    constructor(private svc: EstadisticaService) { }

    ngOnInit() {
        this.load();
    }

    load() {
        this.svc.getLogueosUsuarios(
            this.fechaInicio, this.fechaFin,
            this.pageIndex, this.pageSize
        ).subscribe(res => {
            this.data = res.content;
            this.total = res.page.totalElements;
        });
    }

    pageChanged(e: PageEvent) {
        this.pageIndex = e.pageIndex;
        this.pageSize = e.pageSize;
        this.load();
    }

    exportCsv() {
        this.isExporting = true;
        this.svc.exportLogueosCsv(this.fechaInicio, this.fechaFin).subscribe({
            next: blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'usuarios_logueos.csv';
                a.click();
                window.URL.revokeObjectURL(url);
            },
            complete: () => this.isExporting = false,
            error: () => this.isExporting = false
        });
    }
}
