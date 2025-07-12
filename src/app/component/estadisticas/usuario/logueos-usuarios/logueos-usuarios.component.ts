import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { EstadisticaUsuarioService } from '../../../../services/estadistica-usuario.service';
import { EstadisticaLogueos } from '../../../../models/estadisticas/usuario/estadistica-logueos';
import { Page } from '../../../../models';
import { NgChartsModule } from 'ng2-charts';
import { ChartDataset, ChartOptions, ChartType } from 'chart.js';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { environment } from '../../../../../environments/environment';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-logueos-usuarios',
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
    templateUrl: './logueos-usuarios.component.html',
    styleUrls: ['./logueos-usuarios.component.scss']
})
export class LogueosUsuariosComponent implements OnInit, AfterViewInit, OnDestroy {
    private readonly BASE = `${environment.apiBaseUrl}`;
    private destroy$ = new Subject<void>();
    @ViewChild(MatSort) sort!: MatSort;

    data: EstadisticaLogueos[] = [];
    total = 0;
    pageSize = 10;
    pageIndex = 0;
    ordenarPor = 'email';
    ascendente = true;

    today = new Date();
    firstDayOfYear = new Date(this.today.getFullYear(), 0, 1);

    fechaInicio = new FormControl<Date | null>(this.firstDayOfYear);
    fechaFin = new FormControl<Date | null>(new Date());

    downloadingCsv = false;
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

    ngAfterViewInit() {
        this.sort.sortChange.subscribe((sort: Sort) => {
            this.ordenarPor = sort.active || 'email';
            this.ascendente = sort.direction === 'asc';
            this.pageIndex = 0;
            this.load();
        });
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
        this.fechaInicio.setValue(this.firstDayOfYear);
        this.fechaFin.setValue(new Date());
        this.destroy$.next();
        this.destroy$.complete();
    }

    load(event?: PageEvent) {
        this.loading = true;
        if (event) {
            this.pageIndex = event.pageIndex;
            this.pageSize = event.pageSize;
        }

        this.svc.getLogueosUsuarios(
            this.formatDate(this.fechaInicio.value),
            this.formatDate(this.fechaFin.value),
            this.pageIndex,
            this.pageSize,
            this.ordenarPor,
            this.ascendente
        ).subscribe({
            next: (res: Page<EstadisticaLogueos>) => {
                this.data = res.content;
                this.total = res.page.totalElements;
                this.chartLabels = res.content.map(x => x.email);
                this.chartData = [
                    { data: res.content.map(x => x.cantidadLogueos), backgroundColor: '#1976d2', label: 'Cantidad Logueos' }
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

    filtrar() {
        localStorage.setItem('filtrosLogueosUsuarios', JSON.stringify({
            fechaInicio: this.fechaInicio.value?.toISOString() || null,
            fechaFin: this.fechaFin.value?.toISOString() || null
        }));
        this.pageIndex = 0;
        this.load();
    }

    pageChanged(e: PageEvent) {
        this.pageIndex = e.pageIndex;
        this.pageSize = e.pageSize;
        this.load();
    }

    exportCsv() {
        const inicio = this.formatDate(this.fechaInicio.value);
        const fin = this.formatDate(this.fechaFin.value);

        this.downloadingCsv = true;
        this.svc.exportLogueosCsv(inicio || undefined, fin || undefined).subscribe({
            next: (blob: Blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'usuarios_logueos.csv';
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
            fechaInicio: this.formatDate(this.fechaInicio.value) || '',
            fechaFin: this.formatDate(this.fechaFin.value) || '',
            ordenarPor: this.ordenarPor,
            ascendente: this.ascendente.toString(),
            token
        });
        const url = `${this.BASE}/usuarios/estadisticas/logueos/export/pdf?${params.toString()}`;
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
