import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { EstadisticaOmnibus } from '../../../../models/estadisticas/transporte/estadistica-omnibus';
import { Page } from '../../../../models';
import { EstadisticaTransporteService } from '../../../../services/estadistica-transporte.service';
import { CommonModule } from '@angular/common';

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
        MatButtonModule
    ],
    templateUrl: './viajes-por-omnibus.component.html',
    styleUrls: ['./viajes-por-omnibus.component.scss']
})
export class ViajesPorOmnibusComponent implements OnInit {
    fechaInicio = new FormControl<string | null>(null);
    fechaFin = new FormControl<string | null>(null);
    displayedColumns = ['matricula', 'cantidad'];
    dataSource: EstadisticaOmnibus[] = [];
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
        this.svc.getViajesPorOmnibus(
            this.fechaInicio.value || undefined,
            this.fechaFin.value || undefined,
            this.pageIndex,
            this.pageSize
        ).subscribe((p: Page<EstadisticaOmnibus>) => {
            this.dataSource = p.content;
           // this.total = p.totalElements;
        });
    }
    exportCsv() {
        this.svc.exportViajesPorOmnibusCsv({
            fechaInicio: this.fechaInicio.value || undefined,
            fechaFin: this.fechaFin.value || undefined
        }).subscribe(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'viajes_omnibus.csv';
            a.click();
            URL.revokeObjectURL(url);
        });
    }
}
