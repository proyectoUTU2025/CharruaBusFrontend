import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { EstadisticaPasaje } from '../../../../models/estadisticas/transporte/estadistica-pasaje';
import { Page } from '../../../../models';
import { TipoDepartamento } from '../../../../models/estadisticas/transporte/tipo-departamento';
import { EstadisticaTransporteService } from '../../../../services/estadistica-transporte.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-pasajes-agrupados',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule
    ],
    templateUrl: './pasajes-agrupados.component.html',
    styleUrls: ['./pasajes-agrupados.component.scss']
})
export class PasajesAgrupadosComponent implements OnInit {
    fechaInicio = new FormControl<string | null>(null);
    fechaFin = new FormControl<string | null>(null);
    origen = new FormControl<TipoDepartamento | null>(null);
    destino = new FormControl<TipoDepartamento | null>(null);
    departamentos = Object.values(TipoDepartamento);
    displayedColumns = ['destino', 'vendidos'];
    dataSource: EstadisticaPasaje[] = [];
    total = 0;
    pageSize = 10;
    pageIndex = 0;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    constructor(private svc: EstadisticaTransporteService) { }
    ngOnInit() { this.load(); }
    load(event?: PageEvent) {
        if (event) {
            this.pageIndex = event.pageIndex;
            this.pageSize = event.pageSize;
        }
        this.svc.getPasajesAgrupados(
            this.fechaInicio.value || undefined,
            this.fechaFin.value || undefined,
            this.origen.value || undefined,
            this.destino.value || undefined,
            this.pageIndex,
            this.pageSize
        ).subscribe((p: Page<EstadisticaPasaje>) => {
            this.dataSource = p.content;
            this.total = p.totalElements;
        });
    }
    exportCsv() {
        this.svc.exportPasajesAgrupadosCsv({
            fechaInicio: this.fechaInicio.value || undefined,
            fechaFin: this.fechaFin.value || undefined,
            origen: this.origen.value || undefined,
            destino: this.destino.value || undefined
        }).subscribe(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'estadisticas_pasajes_agrupado.csv';
            a.click();
            URL.revokeObjectURL(url);
        });
    }
}
