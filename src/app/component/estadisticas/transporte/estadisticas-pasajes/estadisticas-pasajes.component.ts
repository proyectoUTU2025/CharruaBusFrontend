import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
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
import { MatIconModule } from '@angular/material/icon';
import { ChartOptions, ChartType, ChartDataset } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { EstadisticaPasaje } from '../../../../models/estadisticas/transporte/estadistica-pasaje';
import { Page } from '../../../../models';
import { TipoDepartamento } from '../../../../models/estadisticas/transporte/tipo-departamento';
import { EstadisticaTransporteService } from '../../../../services/estadistica-transporte.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../environments/environment';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
        MatNativeDateModule,
        MatIconModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './estadisticas-pasajes.component.html',
    styleUrls: ['./estadisticas-pasajes.component.scss']
})
export class EstadisticasPasajesComponent implements OnInit, OnDestroy {

    private readonly BASE = `${environment.apiBaseUrl}`;
    private destroy$ = new Subject<void>();
    
    fechaInicioPorDefecto = new Date(2025, 0, 1); // 1-1-2025
    fechaFinPorDefecto = new Date();
    origenPorDefecto = null;
    destinoPorDefecto = null;

    // filtros
    fechaInicio = new FormControl<Date | null>(this.fechaInicioPorDefecto);
    fechaFin = new FormControl<Date | null>(this.fechaFinPorDefecto);
    origen = new FormControl<TipoDepartamento | null>(this.origenPorDefecto);
    destino = new FormControl<TipoDepartamento | null>(this.destinoPorDefecto);
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

    constructor(private svc: EstadisticaTransporteService) { }

    ngOnInit() {
        // Siempre setear los valores por defecto
        this.fechaInicio.setValue(this.fechaInicioPorDefecto);
        this.fechaFin.setValue(this.fechaFinPorDefecto);
        this.origen.setValue(this.origenPorDefecto);
        this.destino.setValue(this.destinoPorDefecto);
        localStorage.removeItem('filtrosEstadisticasPasajes');
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
        localStorage.removeItem('filtrosEstadisticasPasajes');
        this.fechaInicio.setValue(this.fechaInicioPorDefecto);
        this.fechaFin.setValue(this.fechaFinPorDefecto);
        this.origen.setValue(this.origenPorDefecto);
        this.destino.setValue(this.destinoPorDefecto);
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

        // RESUMEN
        const resumen$ = this.svc.getEstadisticaPasajes(
            inicio || undefined,
            fin || undefined,
            this.origen.value || undefined,
            this.destino.value || undefined
        );

        // AGRUPADO
        const agrupado$ = this.svc.getPasajesAgrupados(
            inicio || undefined,
            fin || undefined,
            this.origen.value || undefined,
            this.destino.value || undefined,
            this.pageIndex,
            this.pageSize,
            this.ordenarPor,
            this.ascendente
        );

        forkJoin({ resumen: resumen$, agrupado: agrupado$ }).subscribe({
            next: ({resumen, agrupado}) => {
                this.resumen = resumen;
                this.dataSource = agrupado.content;
                this.total = agrupado.page.totalElements;

                if (this.mostrarGrafico) {
                    this.chartLabels = agrupado.content.map(e => e.destino);
                    this.chartData = [{
                        label: 'Pasajes vendidos',
                        data: agrupado.content.map(e => e.vendidos),
                        backgroundColor: '#1976d2'
                    }];
                } else {
                    this.chartLabels = [];
                    this.chartData = [];
                }
                this.loading = false;
            },
            error: () => {
                this.resumen = null;
                this.dataSource = [];
                this.total = 0;
                this.chartLabels = [];
                this.chartData = [];
                this.loading = false;
            }
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

        const url = `${this.BASE}/pasajes/estadisticas/export/pdf?${params.toString()}`;
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

        const url = `${this.BASE}/pasajes/estadisticas/agrupado/export/pdf?${params.toString()}`;
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
        if (this.dataSource.length > 1) {
            return true;
        }
        if (this.dataSource.length === 1) {
            const item = this.dataSource[0];
            return item.destino !== 'TODOS' || item.vendidos > 0;
        }
        return false;
    }
}
