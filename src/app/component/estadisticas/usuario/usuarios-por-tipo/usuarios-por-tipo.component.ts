import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EstadisticaUsuarioService } from '../../../../services/estadistica-usuario.service';
import { EstadisticaUsuario } from '../../../../models/estadisticas/usuario/estadistica-usuario';
import { ChartCardComponent } from '../../../shared/chart-card/chart-card.component';
import { Page } from '../../../../models';

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

    isExportingCsv = false;
    isExportingPdf = false;

    chartLabels: string[] = [];
    chartData: number[] = [];

    constructor(private svc: EstadisticaUsuarioService) { }

    ngOnInit() {
        this.load();
    }

    load() {
        this.svc
            .getUsuariosPorTipo(this.pageIndex, this.pageSize, 'tipo', this.ascendente)
            .subscribe({
                next: (res: Page<EstadisticaUsuario>) => {
                    this.data = res.content;
                    this.total = res.page.totalElements;
                    this.chartLabels = this.data.map(x => x.tipo);
                    this.chartData = this.data.map(x => x.cantidad);
                },
                error: err => console.error('Error cargando estadísticas:', err)
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
        this.isExportingCsv = true;
        this.svc.exportUsuariosPorTipoCsv().subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'usuarios_por_tipo.csv';
                a.click();
                window.URL.revokeObjectURL(url);
            },
            complete: () => (this.isExportingCsv = false),
            error: () => (this.isExportingCsv = false)
        });
    }

    exportPdf() {
        this.isExportingPdf = true;
        this.svc.exportUsuariosPorTipoPdf().subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'usuarios_por_tipo.pdf';
                a.click();
                window.URL.revokeObjectURL(url);
            },
            complete: () => (this.isExportingPdf = false),
            error: () => (this.isExportingPdf = false)
        });
    }
}
