import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EstadisticaUsuarioService } from '../../../../services/estadistica-usuario.service';
import { EstadisticaClienteCompras } from '../../../../models/estadisticas/usuario/estadistica-cliente-compras';
import { Page } from '../../../../models';
import { ChartOptions, ChartType, ChartDataset } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-compras-clientes',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        NgChartsModule,
        MatIconModule,
        MatSortModule
    ],
    templateUrl: './compras-clientes.component.html',
    styleUrls: ['./compras-clientes.component.scss']
})

export class ComprasClientesComponent implements OnInit, AfterViewInit {
    private readonly BASE = `${environment.apiBaseUrl}`;
    @ViewChild(MatSort) sort!: MatSort;

    data: EstadisticaClienteCompras[] = [];
    total = 0;
    pageSize = 10;
    pageIndex = 0;
    ordenarPor = 'totalGastado';
    ascendente = false;

    fechaInicio = new FormControl<Date | null>(new Date('2000-01-01'));
    fechaFin = new FormControl<Date | null>(new Date());

    isExportingCsv = false;

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

    constructor(private svc: EstadisticaUsuarioService) { }

    ngOnInit() {
        this.load();
    }

    ngAfterViewInit() {
        this.sort.sortChange.subscribe((sort: Sort) => {
            this.ordenarPor = sort.active || 'totalGastado';
            this.ascendente = sort.direction === 'asc';
            this.pageIndex = 0;
            this.load();
        });
    }

    load(event?: PageEvent) {
        if (event) {
            this.pageIndex = event.pageIndex;
            this.pageSize = event.pageSize;
        }

        this.svc.getComprasClientes(
            this.formatDate(this.fechaInicio.value),
            this.formatDate(this.fechaFin.value),
            this.pageIndex,
            this.pageSize,
            this.ordenarPor,
            this.ascendente
        ).subscribe({
            next: (res: Page<EstadisticaClienteCompras>) => {
                this.data = res.content;
                this.total = res.page.totalElements;
                this.chartLabels = res.content.map(x => x.email);
                this.chartData = [
                    { data: res.content.map(x => x.totalGastado), backgroundColor: '#1976d2', label: 'Total Gastado' }
                ];
            },
            error: err => console.error('Error cargando:', err)
        });
    }

    filtrar() {
        localStorage.setItem('filtrosComprasClientes', JSON.stringify({
            fechaInicio: this.fechaInicio.value?.toISOString() || null,
            fechaFin: this.fechaFin.value?.toISOString() || null
        }));
        this.pageIndex = 0;
        this.load();
    }

    exportCsv() {
        this.isExportingCsv = true;
        this.svc.exportComprasClientesCsv(
            this.formatDate(this.fechaInicio.value),
            this.formatDate(this.fechaFin.value)
        ).subscribe({
            next: blob => {
                if (blob.size > 0) {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'compras_clientes.csv';
                    a.click();
                    window.URL.revokeObjectURL(url);
                } else {
                    alert('El archivo CSV vino vacío.');
                }
            },
            complete: () => this.isExportingCsv = false,
            error: () => {
                this.isExportingCsv = false;
                alert('Hubo un problema descargando el CSV. Intenta nuevamente.');
            }
        });
    }

    exportPdf() {
        const token = this.getCookie('access_token') || '';
        const params = new URLSearchParams({
            fechaInicio: this.formatDate(this.fechaInicio.value) || '',
            fechaFin: this.formatDate(this.fechaFin.value) || '',
            ordenarPor: this.ordenarPor,
            ascendente: this.ascendente.toString(),
            token
        });
        const url = `${this.BASE}/usuarios/estadisticas/compras-clientes/export/pdf?${params.toString()}`;
        window.open(url, '_blank');
    }

    private formatDate(date: Date | null): string | undefined {
        if (!date) return undefined;
        return date.toISOString().slice(0, 10);
    }

    private getCookie(name: string): string | null {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    }
}
