import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { ChartOptions, ChartType, ChartDataset } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { EstadisticaPasaje } from '../../../../models/estadisticas/transporte/estadistica-pasaje';
import { Page } from '../../../../models';
import { TipoDepartamento } from '../../../../models/estadisticas/transporte/tipo-departamento';
import { EstadisticaTransporteService } from '../../../../services/estadistica-transporte.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-estadisticas-pasajes',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatCardModule,
        MatTableModule,
        MatPaginatorModule,
        NgChartsModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    templateUrl: './estadisticas-pasajes.component.html',
    styleUrls: ['./estadisticas-pasajes.component.scss']
})
export class EstadisticasPasajesComponent implements OnInit {

    // filtros
    fechaInicio = new FormControl<Date | null>(new Date('2000-01-01'));
    fechaFin = new FormControl<Date | null>(new Date());
    origen = new FormControl<TipoDepartamento | null>(null);
    destino = new FormControl<TipoDepartamento | null>(null);
    departamentos = Object.values(TipoDepartamento);

    // resumen
    resumen: EstadisticaPasaje | null = null;

    // agrupado
    displayedColumns = ['destino', 'vendidos'];
    dataSource: EstadisticaPasaje[] = [];
    total = 0;
    pageSize = 10;
    pageIndex = 0;
    ordenarPor = 'vendidos';
    ascendente = true;

    downloadingCsv = false;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    chartData: ChartDataset<'bar'>[] = [];
    chartLabels: string[] = [];
    chartOptions: ChartOptions = {
        responsive: true,
        scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } },
            x: { ticks: { maxRotation: 45, minRotation: 45 } }
        },
        plugins: { legend: { display: false } }
    };
    chartType: ChartType = 'bar';

    constructor(private svc: EstadisticaTransporteService) { }

    ngOnInit() {
        const saved = localStorage.getItem('filtrosEstadisticasPasajes');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.fechaInicio.setValue(parsed.fechaInicio ? new Date(parsed.fechaInicio) : new Date('2000-01-01'));
            this.fechaFin.setValue(parsed.fechaFin ? new Date(parsed.fechaFin) : new Date());
            this.origen.setValue(parsed.origen ?? null);
            this.destino.setValue(parsed.destino ?? null);
        }
        this.load();
    }

    load(event?: PageEvent) {
        if (event) {
            this.pageIndex = event.pageIndex;
            this.pageSize = event.pageSize;
        }
        const inicio = this.formatDate(this.fechaInicio.value);
        const fin = this.formatDate(this.fechaFin.value);

        // RESUMEN
        this.svc.getEstadisticaPasajes(
            inicio || undefined,
            fin || undefined,
            this.origen.value || undefined,
            this.destino.value || undefined
        ).subscribe(r => this.resumen = r);

        // AGRUPADO
        this.svc.getPasajesAgrupados(
            inicio || undefined,
            fin || undefined,
            this.origen.value || undefined,
            this.destino.value || undefined,
            this.pageIndex,
            this.pageSize,
            this.ordenarPor,
            this.ascendente
        ).subscribe((p: Page<EstadisticaPasaje>) => {
            this.dataSource = p.content;
            this.total = p.page.totalElements;

            this.chartLabels = p.content.map(e => e.destino);
            this.chartData = [{
                label: 'Pasajes vendidos',
                data: p.content.map(e => e.vendidos),
                backgroundColor: '#1976d2'
            }];
        });
    }

    filtrar() {
        const filtro = {
            fechaInicio: this.fechaInicio.value?.toISOString() || null,
            fechaFin: this.fechaFin.value?.toISOString() || null,
            origen: this.origen.value,
            destino: this.destino.value
        };
        localStorage.setItem('filtrosEstadisticasPasajes', JSON.stringify(filtro));
        this.pageIndex = 0;
        this.load();
    }

    toggleSort(columna: string) {
        if (this.ordenarPor === columna) {
            this.ascendente = !this.ascendente;
        } else {
            this.ordenarPor = columna;
            this.ascendente = true;
        }
        this.load();
    }

    exportResumenCsv() {
        const inicio = this.formatDate(this.fechaInicio.value);
        const fin = this.formatDate(this.fechaFin.value);
    
        const params: any = {
            fechaInicio: inicio || undefined,
            fechaFin: fin || undefined
        };
        if (this.origen.value) params.origen = this.origen.value;
        if (this.destino.value) params.destino = this.destino.value;
    
        this.downloadingCsv = true;
        this.svc.exportEstadisticaPasajesCsv(params).subscribe({
            next: (blob) => {
                if (blob.size > 0) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'resumen_estadisticas_pasajes.csv';
                    a.click();
                    URL.revokeObjectURL(url);
                } else {
                    alert("El archivo CSV vino vacío.");
                }
                this.downloadingCsv = false;
            },
            error: (err) => {
                console.error("Error descargando CSV", err);
                alert("Hubo un problema descargando el CSV. Intenta nuevamente.");
                this.downloadingCsv = false;
            }
        });
    }

    exportDetalleCsv() {
        const inicio = this.formatDate(this.fechaInicio.value);
        const fin = this.formatDate(this.fechaFin.value);
    
        const params: any = {
            fechaInicio: inicio || undefined,
            fechaFin: fin || undefined,
            ordenarPor: 'vendidos', // o cualquier otro valor por defecto
            ascendente: true
        };
        if (this.origen.value) params.origen = this.origen.value;
        if (this.destino.value) params.destino = this.destino.value;
    
        this.downloadingCsv = true;
        this.svc.exportPasajesAgrupadosCsv(params).subscribe({
            next: (blob) => {
                if (blob.size > 0) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'agrupado_estadisticas_pasajes.csv';
                    a.click();
                    URL.revokeObjectURL(url);
                } else {
                    alert("El archivo CSV vino vacío.");
                }
                this.downloadingCsv = false;
            },
            error: (err) => {
                console.error("⛔ Error descargando CSV", err);
                alert("Hubo un problema descargando el CSV. Intenta nuevamente.");
                this.downloadingCsv = false;
            }
        });
    }

    exportResumenPdf() {
        const inicio = this.formatDate(this.fechaInicio.value);
        const fin = this.formatDate(this.fechaFin.value);
        const token = this.getCookie('access_token') || '';

        const params = new URLSearchParams({
            fechaInicio: inicio || '',
            fechaFin: fin || '',
            origen: this.origen.value || '',
            destino: this.destino.value || '',
            token
        });

        const url = `http://localhost:8080/pasajes/estadisticas/export/pdf?${params.toString()}`;
        window.open(url, '_blank');
    }

    exportDetallePdf() {
        const inicio = this.formatDate(this.fechaInicio.value);
        const fin = this.formatDate(this.fechaFin.value);
        const token = this.getCookie('access_token') || '';

        const params = new URLSearchParams({
            fechaInicio: inicio || '',
            fechaFin: fin || '',
            origen: this.origen.value || '',
            destino: this.destino.value || '',
            token
        });

        const url = `http://localhost:8080/pasajes/estadisticas/agrupado/export/pdf?${params.toString()}`;
        window.open(url, '_blank');
    }

    private getCookie(name: string): string | null {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    }

    private formatDate(date: Date | null): string | null {
        if (!date) return null;
        return date.toISOString().slice(0, 10);
    }

    get mostrarGrafico(): boolean {
        return this.dataSource.length > 0;
    }
}
