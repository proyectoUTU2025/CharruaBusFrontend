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
        MatButtonModule
    ],
    templateUrl: './viajes-departamento.component.html',
    styleUrls: ['./viajes-departamento.component.scss']
})
export class ViajesDepartamentoComponent implements OnInit {
    fechaInicio = new FormControl<string | null>(null);
    fechaFin = new FormControl<string | null>(null);
    origen = new FormControl<TipoDepartamento | null>(null);
    destino = new FormControl<TipoDepartamento | null>(null);
    departamentos = Object.values(TipoDepartamento);
    displayedColumns = ['departamento', 'cantidadViajes'];
    dataSource: EstadisticaViajePorDepartamento[] = [];
    total = 0;
    pageSize = 10;
    pageIndex = 0;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    constructor(private svc: EstadisticaTransporteService) { }
    ngOnInit() {
        this.load();
    }
    load(event?: PageEvent) {
        if (event) {
            this.pageIndex = event.pageIndex;
            this.pageSize = event.pageSize;
        }
        this.svc.getViajesPorDepartamento(
            this.fechaInicio.value || undefined,
            this.fechaFin.value || undefined,
            this.origen.value || undefined,
            this.destino.value || undefined,
            this.pageIndex,
            this.pageSize
        ).subscribe((p: Page<EstadisticaViajePorDepartamento>) => {
            this.dataSource = p.content;
            this.total = p.page.totalElements;
        });
    }
    exportCsv() {
        this.svc.exportViajesPorDepartamentoCsv({
            fechaInicio: this.fechaInicio.value || undefined,
            fechaFin: this.fechaFin.value || undefined,
            origen: this.origen.value || undefined,
            destino: this.destino.value || undefined
        }).subscribe(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'viajes_departamento.csv';
            a.click();
            URL.revokeObjectURL(url);
        });
    }
}
