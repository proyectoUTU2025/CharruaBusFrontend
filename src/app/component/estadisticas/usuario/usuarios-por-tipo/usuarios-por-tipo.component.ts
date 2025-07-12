import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EstadisticaUsuarioService } from '../../../../services/estadistica-usuario.service';
import { EstadisticaUsuario } from '../../../../models/estadisticas/usuario/estadistica-usuario';
import { Page } from '../../../../models';
import { NgChartsModule } from 'ng2-charts';
import { ChartOptions, ChartType, ChartDataset } from 'chart.js';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-usuarios-por-tipo',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        NgChartsModule,
        MatIconModule,
        MatSortModule
    ],
    templateUrl: './usuarios-por-tipo.component.html',
    styleUrls: ['./usuarios-por-tipo.component.scss']
})
export class UsuariosPorTipoComponent implements OnInit, AfterViewInit {
    private readonly BASE = `${environment.apiBaseUrl}`;
    @ViewChild(MatSort) sort!: MatSort;

    data: EstadisticaUsuario[] = [];
    total = 0;
    pageSize = 10;
    pageIndex = 0;
    ordenarPor = 'tipo';
    ascendente = true;

    downloadingCsv = false;
    downloadingPdf = false;

    chartLabels: string[] = [];
    chartData: ChartDataset<'bar'>[] = [];
    chartType: ChartType = 'bar';
    chartOptions: ChartOptions = {
        responsive: true,
        scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } },
            x: { ticks: { maxRotation: 45, minRotation: 45 } }
        },
        plugins: { legend: { display: false } }
    };

    agrupado: boolean = true;

    dataOriginal: EstadisticaUsuario[] = [];

    constructor(private svc: EstadisticaUsuarioService) { }

    ngOnInit() {
        this.load();
    }

    ngAfterViewInit() {
        this.sort.sortChange.subscribe((sort: Sort) => {
            this.ordenarPor = sort.active || 'tipo';
            this.ascendente = sort.direction === 'asc';
            this.pageIndex = 0;
            this.load();
        });
    }

    toggleAgrupado() {
        this.agrupado = !this.agrupado;
        this.procesarDatos();
    }

    load() {
        this.svc.getUsuariosPorTipo(this.pageIndex, this.pageSize, this.ordenarPor, this.ascendente)
            .subscribe({
                next: (res: Page<EstadisticaUsuario>) => {
                    this.dataOriginal = res.content;
                    this.total = res.page.totalElements;
                    this.procesarDatos();
                },
                error: err => console.error('Error cargando estadísticas:', err)
            });
    }

    procesarDatos() {
        if (this.agrupado) {
            const tieneCliente = this.dataOriginal.some(x => x.tipo === 'CLIENTE');
            const agrupados: { [key: string]: number } = {};
            for (const item of this.dataOriginal) {
                if (item.tipo === 'CLIENTE') {
                    agrupados['CLIENTE'] = item.cantidad;
                } else if (item.tipo.startsWith('CLIENTE')) {
                    if (!tieneCliente) {
                        agrupados['CLIENTE'] = (agrupados['CLIENTE'] || 0) + item.cantidad;
                    }
                } else {
                    agrupados[item.tipo] = (agrupados[item.tipo] || 0) + item.cantidad;
                }
            }
            this.data = Object.entries(agrupados).map(([tipo, cantidad]) => ({ tipo, cantidad }));
        } else {
            const subtipos = ['CLIENTE_ESTUDIANTE', 'CLIENTE_JUBILADO', 'CLIENTE_OTRO'];
            const nombreAmigable: { [key: string]: string } = {
                'CLIENTE_ESTUDIANTE': 'ESTUDIANTE',
                'CLIENTE_JUBILADO': 'JUBILADO',
                'CLIENTE_OTRO': 'OTRO'
            };
            this.data = this.dataOriginal
                .filter(x => subtipos.includes(x.tipo))
                .map(x => ({ tipo: nombreAmigable[x.tipo] || x.tipo, cantidad: x.cantidad }));
        }
        this.chartLabels = this.data.map(x => x.tipo);
        this.chartData = [{
            label: 'Usuarios por Tipo',
            data: this.data.map(x => x.cantidad),
            backgroundColor: '#1976d2'
        }];
    }

    pageChanged(e: PageEvent) {
        this.pageIndex = e.pageIndex;
        this.pageSize = e.pageSize;
        this.load();
    }

    exportCsv() {
        this.downloadingCsv = true;
        this.svc.exportUsuariosPorTipoCsv().subscribe({
            next: (blob: Blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'usuarios_por_tipo.csv';
                a.click();
                URL.revokeObjectURL(url);
            },
            complete: () => this.downloadingCsv = false,
            error: () => this.downloadingCsv = false
        });
    }

    exportPdf() {
        const token = this.getCookie('access_token') || '';
        const params = new URLSearchParams({
            ordenarPor: this.ordenarPor,
            ascendente: this.ascendente.toString(),
            token
        });
        const url = `${this.BASE}/usuarios/estadisticas/tipo/export/pdf?${params.toString()}`;
        window.open(url, '_blank');
    }

    private getCookie(name: string): string | null {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    }
}
