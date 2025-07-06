import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TipoDepartamento } from '../../../../models/estadisticas/transporte/tipo-departamento';
import { EstadisticaViajePorDepartamento } from '../../../../models/estadisticas/transporte/estadistica-viaje-departamento';
import { Page } from '../../../../models';
import { EstadisticaTransporteService } from '../../../../services/estadistica-transporte.service';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NgChartsModule } from 'ng2-charts';
import { ChartOptions, ChartType, ChartDataset } from 'chart.js';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-viajes-departamento',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgChartsModule,
    MatIconModule
  ],
  templateUrl: './viajes-departamento.component.html',
  styleUrls: ['./viajes-departamento.component.scss']
})
export class ViajesDepartamentoComponent implements OnInit {
  private readonly BASE = `${environment.apiBaseUrl}`;

  fechaInicio = new FormControl<Date | null>(new Date('2000-01-01'));
  fechaFin = new FormControl<Date | null>(new Date());
  origen = new FormControl<TipoDepartamento | null>(TipoDepartamento.ARTIGAS);
  destino = new FormControl<TipoDepartamento | null>(null);

  departamentos = Object.values(TipoDepartamento);
  displayedColumns = ['departamento', 'cantidadViajes'];
  dataSource: EstadisticaViajePorDepartamento[] = [];
  total = 0;
  pageSize = 10;
  pageIndex = 0;
  ordenarPor = 'departamento';
  ascendente = true;
  downloadingCsv = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  chartData: ChartDataset<'bar'>[] = [];
  chartLabels: string[] = [];
  chartOptions: ChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };
  chartType: ChartType = 'bar';

  constructor(private svc: EstadisticaTransporteService) {}

  ngOnInit() {
    const saved = localStorage.getItem('filtrosViajesDepartamento');
    if (saved) {
      const parsed = JSON.parse(saved);
      this.fechaInicio.setValue(parsed.fechaInicio ? new Date(parsed.fechaInicio) : new Date('2000-01-01'));
      this.fechaFin.setValue(parsed.fechaFin ? new Date(parsed.fechaFin) : new Date());
      this.origen.setValue(parsed.origen ?? null);
      this.destino.setValue(parsed.destino ?? null);
    } else {
      this.fechaInicio.setValue(new Date('2000-01-01'));
      this.fechaFin.setValue(new Date());
      this.origen.setValue(TipoDepartamento.MONTEVIDEO);
      this.destino.setValue(null);
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

    this.svc.getViajesPorDepartamento(
      inicio || undefined,
      fin || undefined,
      this.origen.value || undefined,
      this.destino.value || undefined,
      this.pageIndex,
      this.pageSize,
      this.ordenarPor,
      this.ascendente
    ).subscribe((p: Page<EstadisticaViajePorDepartamento>) => {
      this.dataSource = p.content;
      this.total = p.page.totalElements;

      if (this.mostrarGrafico) {
        this.chartLabels = p.content.map(e => e.departamento);
        this.chartData = [{
          label: 'Cantidad de viajes',
          data: p.content.map(e => e.cantidadViajes),
          backgroundColor: '#1976d2'
        }];
      } else {
        this.chartLabels = [];
        this.chartData = [];
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
    localStorage.setItem('filtrosViajesDepartamento', JSON.stringify(filtro));
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

    const options: any = {
      fechaInicio: inicio || undefined,
      fechaFin: fin || undefined,
      ordenarPor: 'departamento',
      ascendente: true
    };
    if (this.origen.value) options.origen = this.origen.value;
    if (this.destino.value) options.destino = this.destino.value;

    this.downloadingCsv = true;
    this.svc.exportViajesPorDepartamentoCsv(options).subscribe({
      next: (blob) => {
        if (blob.size > 0) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'viajes_departamento.csv';
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
      ordenarPor: 'departamento',
      ascendente: 'true',
      token
    });

    const url = `${this.BASE}/viajes/departamento/export/pdf?${params.toString()}`;
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

  get mostrarGrafico(): boolean {
    return this.dataSource.length > 1 || (this.dataSource.length === 1 && this.dataSource[0].departamento !== 'TODOS');
  }
}
