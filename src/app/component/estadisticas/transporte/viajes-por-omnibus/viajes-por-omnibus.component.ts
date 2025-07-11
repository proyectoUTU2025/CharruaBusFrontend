import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { EstadisticaOmnibus } from '../../../../models/estadisticas/transporte/estadistica-omnibus';
import { Page } from '../../../../models';
import { EstadisticaTransporteService } from '../../../../services/estadistica-transporte.service';
import { ChartOptions, ChartType, ChartDataset } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../../../environments/environment';
import { Subject, takeUntil } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-viajes-por-omnibus',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        NgChartsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './viajes-por-omnibus.component.html',
    styleUrls: ['./viajes-por-omnibus.component.scss']
    })
    export class ViajesPorOmnibusComponent implements OnInit, OnDestroy {
    private readonly BASE = `${environment.apiBaseUrl}`;
    private destroy$ = new Subject<void>();

    fechaInicioPorDefecto = new Date(2025, 0, 1); // 1-1-2025
    fechaFinPorDefecto = new Date();

    fechaInicio = new FormControl<Date | null>(this.fechaInicioPorDefecto);
    fechaFin = new FormControl<Date | null>(this.fechaFinPorDefecto);
    displayedColumns = ['matricula', 'cantidad'];
    dataSource: EstadisticaOmnibus[] = [];
    total = 0;
    pageSize = 10;
    pageIndex = 0;
    ordenarPor = 'matricula';
    ascendente = true;
    downloadingCsv = false;
    minDateForFin: Date | null = null;
    loading = false;

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

    constructor(private svc: EstadisticaTransporteService) {}

    ngOnInit() {
        // Siempre setear los valores por defecto
        this.fechaInicio.setValue(this.fechaInicioPorDefecto);
        this.fechaFin.setValue(this.fechaFinPorDefecto);
        localStorage.removeItem('filtrosViajesOmnibus');
        this.setupDateFilters();
        this.load();
    }

    setupDateFilters(): void {
      this.fechaInicio.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(value => {
          this.minDateForFin = value ? new Date(value) : null;
          
          const fechaFinControl = this.fechaFin;
          if (fechaFinControl?.value && this.minDateForFin && fechaFinControl.value < this.minDateForFin) {
            fechaFinControl.setValue(null);
          }
        });
  
      if (this.fechaInicio.value) {
        this.minDateForFin = new Date(this.fechaInicio.value);
      }
    }

    ngOnDestroy() {
        // Limpiar localStorage y resetear los filtros al salir del componente
        localStorage.removeItem('filtrosViajesOmnibus');
        this.fechaInicio.setValue(this.fechaInicioPorDefecto);
        this.fechaFin.setValue(this.fechaFinPorDefecto);
        this.destroy$.next();
        this.destroy$.complete();
    }

    load(event?: PageEvent) {
        this.loading = true;
        if (event) {
            this.pageIndex = event.pageIndex;
            this.pageSize = event.pageSize;
        }
        const inicio = this.formatDate(this.fechaInicio.value);
        const fin = this.formatDate(this.fechaFin.value);

        this.svc.getViajesPorOmnibus(
            inicio || undefined,
            fin || undefined,
            this.pageIndex,
            this.pageSize,
            this.ordenarPor,
            this.ascendente
        ).subscribe({
            next: (p: Page<EstadisticaOmnibus>) => {
                this.dataSource = p.content;
                this.total = p.page.totalElements;
    
                this.chartLabels = p.content.map(e => e.matricula);
                this.chartData = [{
                    label: 'Cantidad de viajes',
                    data: p.content.map(e => e.cantidad),
                    backgroundColor: '#1976d2'
                }];
                this.loading = false;
            },
            error: () => {
                this.dataSource = [];
                this.total = 0;
                this.loading = false;
            }
        });
    }

    filtrar() {
        const filtro = {
            fechaInicio: this.fechaInicio.value?.toISOString() || null,
            fechaFin: this.fechaFin.value?.toISOString() || null
        };
        localStorage.setItem('filtrosViajesOmnibus', JSON.stringify(filtro));
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

    exportCsv() {
        const inicio = this.formatDate(this.fechaInicio.value);
        const fin = this.formatDate(this.fechaFin.value);
        
        this.downloadingCsv = true;
        this.svc.exportViajesPorOmnibusCsv({
            fechaInicio: inicio || undefined,
            fechaFin: fin || undefined,
            ordenarPor: 'matricula',
            ascendente: true
        }).subscribe({
            next: (blob) => {
                if (blob.size > 0) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'viajes_omnibus.csv';
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

    exportPdf() {
        const inicio = this.formatDate(this.fechaInicio.value);
        const fin = this.formatDate(this.fechaFin.value);
        const token = this.getCookie('access_token') || '';
        const params = new URLSearchParams({
            fechaInicio: inicio || '',
            fechaFin: fin || '',
            ordenarPor: 'matricula',
            ascendente: 'true',
            token: token
        });
        const url = `${this.BASE}/omnibus/viajes/export/pdf?${params.toString()}`;
        window.open(url, '_blank');
    }

    private formatDate(date: Date | null): string | null {
        if (!date) return null;
        return date.toISOString().slice(0, 10);
    }

    get mostrarGrafico(): boolean {
        return this.dataSource.length > 0;
    }

    private getCookie(name: string): string | null {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        if (match) return match[2];
        return null;
    }
}
