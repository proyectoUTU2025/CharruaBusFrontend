import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EstadisticaService } from '../../../../services/estadistica-usuario.service';
import { EstadisticaUsuario } from '../../../../models/estadisticas/usuario/estadistica-usuario';
import { ChartCardComponent } from '../../../shared/chart-card/chart-card.component';

@Component({
    selector: 'app-usuarios-por-tipo',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        ChartCardComponent
    ],
    templateUrl: './usuarios-por-tipo.component.html',
    styleUrls: ['./usuarios-por-tipo.component.scss']
})
export class UsuariosPorTipoComponent implements OnInit {
    data: EstadisticaUsuario[] = [];
    total = 0;
    pageSize = 10;
    pageIndex = 0;
    ascendente = true;
    isExporting = false;

    // Datos para la gráfica
    chartLabels: string[] = [];
    chartData: number[] = [];

    constructor(private svc: EstadisticaService) { }

    ngOnInit() {
        this.load();
    }

    load() {
        this.svc.getUsuariosPorTipo(
            this.pageIndex, this.pageSize, 'tipo', this.ascendente
        ).subscribe(res => {
            this.data = res.content;
           // this.total = res.totalElements;
            this.chartLabels = this.data.map(x => x.tipo);
            this.chartData = this.data.map(x => x.cantidad);
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
        this.isExporting = true;
        this.svc.exportUsuariosPorTipoCsv().subscribe({
            next: blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'usuarios_por_tipo.csv';
                a.click();
                window.URL.revokeObjectURL(url);
            },
            complete: () => this.isExporting = false,
            error: () => this.isExporting = false
        });
    }
}
