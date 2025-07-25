import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
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
import { Subject, takeUntil, Subscription } from 'rxjs';

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

export class ComprasClientesComponent implements OnInit, AfterViewInit, OnDestroy {
    private readonly BASE = `${environment.apiBaseUrl}`;
    private destroy$ = new Subject<void>();
    private sort!: MatSort;
    private sortSub?: Subscription;

    @ViewChild(MatSort)
    set matSort(ms: MatSort) {
        if (ms) {
            // Si el MatSort cambia (puede ocurrir cuando *ngIf recrea la tabla), nos volvemos a suscribir
            this.sort = ms;
            // Restaurar estado actual de ordenamiento visual después del ciclo de detección de cambios
            setTimeout(() => {
                if (this.sort) {
                    this.sort.active = this.ordenarPor;
                    this.sort.direction = this.ascendente ? 'asc' : 'desc';
                }
            });

            if (this.sortSub) {
                this.sortSub.unsubscribe();
            }
            this.sortSub = this.sort.sortChange.subscribe((sort: Sort) => {
                this.ordenarPor = sort.active || 'totalGastado';
                this.ascendente = sort.direction === 'asc';
                this.pageIndex = 0;
                this.load();
            });
        }
    }

    data: EstadisticaClienteCompras[] = [];
    total = 0;
    pageSize = 10;
    pageIndex = 0;
    ordenarPor = 'totalGastado';
    ascendente = false;

    today = new Date();
    firstDayOfYear = new Date(this.today.getFullYear(), 0, 1);

    fechaInicio = new FormControl<Date | null>(this.firstDayOfYear);
    fechaFin = new FormControl<Date | null>(new Date());

    isExportingCsv = false;
    minDateForFin: Date | null = null;
    loading = false;

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
        this.setupDateFilters();
        this.load();
    }

    ngAfterViewInit() { }

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
        this.fechaInicio.setValue(this.firstDayOfYear);
        this.fechaFin.setValue(new Date());
        if (this.sortSub) {
            this.sortSub.unsubscribe();
        }
        this.destroy$.next();
        this.destroy$.complete();
    }

    load() {
        this.loading = true;
        
        this.svc.getComprasClientes(
            this.formatDate(this.fechaInicio.value) || undefined,
            this.formatDate(this.fechaFin.value) || undefined,
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
                this.loading = false;
            },
            error: err => {
                console.error('Error cargando:', err);
                this.data = [];
                this.total = 0;
                this.chartLabels = [];
                this.chartData = [];
                this.loading = false;
            }
        });
    }

    pageChanged(event: PageEvent) {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;
      this.load();
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
            this.formatDate(this.fechaInicio.value) || undefined,
            this.formatDate(this.fechaFin.value) || undefined
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

    private formatDate(date: Date | null): string | null {
        if (!date) return null;
        return date.toISOString().slice(0, 10);
    }

    private getCookie(name: string): string | null {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    }
}
