import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EstadisticaService } from '../../../../services/estadistica-usuario.service';
import { EstadisticaClienteCompras } from '../../../../models/estadisticas/usuario/estadistica-cliente-compras';
import { ChartCardComponent } from '../../../shared/chart-card/chart-card.component';

@Component({
    selector: 'app-compras-clientes',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        ChartCardComponent
    ],
    templateUrl: './compras-clientes.component.html',
    styleUrls: ['./compras-clientes.component.scss']
})
export class ComprasClientesComponent implements OnInit {
    data: EstadisticaClienteCompras[] = [];
    total = 0;
    pageSize = 10;
    pageIndex = 0;
    ascendente = false;
    fechaInicio = '';
    fechaFin = '';
    isExporting = false;

    // Datos para la gráfica
    chartLabels: string[] = [];
    chartData: number[] = [];

    constructor(private svc: EstadisticaService) { }

    ngOnInit() {
        this.load();
    }

    load() {
        this.svc.getComprasClientes(
            this.fechaInicio, this.fechaFin,
            this.pageIndex, this.pageSize,
            'totalGastado', this.ascendente
        ).subscribe(res => {
            this.data = res.content;
            this.total = res.totalElements;
            this.chartLabels = this.data.map(x => x.email);
            this.chartData = this.data.map(x => x.totalGastado);
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
        this.svc.exportComprasClientesCsv(this.fechaInicio, this.fechaFin).subscribe({
            next: blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'compras_clientes.csv';
                a.click();
                window.URL.revokeObjectURL(url);
            },
            complete: () => this.isExporting = false,
            error: () => this.isExporting = false
        });
    }
}
