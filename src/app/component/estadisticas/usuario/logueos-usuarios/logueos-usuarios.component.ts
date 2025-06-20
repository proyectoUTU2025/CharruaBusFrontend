import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
        MatButtonModule
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
            this.total = res.totalElements;
        });
    }

    pageChanged(e: PageEvent) {
        this.pageIndex = e.pageIndex;
        this.pageSize = e.pageSize;
        this.load();
    }

    exportCsv() {
        this.svc.exportLogueosCsv(this.fechaInicio, this.fechaFin).subscribe(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'usuarios_logueos.csv';
            a.click();
            window.URL.revokeObjectURL(url);
        });
    }
}
