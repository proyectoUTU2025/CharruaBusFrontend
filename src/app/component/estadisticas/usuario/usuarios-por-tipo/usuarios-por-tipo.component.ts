import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { EstadisticaService } from '../../../../services/estadistica-usuario.service';
import { EstadisticaUsuario } from '../../../../models/estadisticas/usuario/estadistica-usuario';

@Component({
    selector: 'app-usuarios-por-tipo',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule
    ],
    templateUrl: './usuarios-por-tipo.component.html',
    styleUrls: ['./usuarios-por-tipo.component.scss']
})
export class UsuariosPorTipoComponent implements OnInit {
    data: EstadisticaUsuario[] = [];
    total = 0;
    pageSize = 10;
    pageIndex = 0;
    ordenarPor = 'tipo';
    ascendente = true;

    constructor(private svc: EstadisticaService) { }

    ngOnInit() {
        this.load();
    }

    load() {
        this.svc.getUsuariosPorTipo(
            this.pageIndex, this.pageSize, this.ordenarPor, this.ascendente
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

    toggleSort() {
        this.ascendente = !this.ascendente;
        this.load();
    }

    exportCsv() {
        this.svc.exportUsuariosPorTipoCsv().subscribe(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'usuarios_por_tipo.csv';
            a.click();
            window.URL.revokeObjectURL(url);
        });
    }
}
