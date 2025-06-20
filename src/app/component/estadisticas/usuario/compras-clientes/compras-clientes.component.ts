import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EstadisticaService } from '../../../../services/estadistica-usuario.service';
import { EstadisticaClienteCompras } from '../../../../models/estadisticas/usuario/estadistica-cliente-compras';

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
        MatButtonModule
    ],
    templateUrl: './compras-clientes.component.html',
    styleUrls: ['./compras-clientes.component.scss']
})
export class ComprasClientesComponent implements OnInit {
    data: EstadisticaClienteCompras[] = [];
    total = 0;
    pageSize = 10;
    pageIndex = 0;
    ordenarPor = 'totalGastado';
    ascendente = false;
    fechaInicio = '';
    fechaFin = '';

    constructor(private svc: EstadisticaService) { }

    ngOnInit() {
        this.load();
    }

    load() {
        this.svc.getComprasClientes(
            this.fechaInicio, this.fechaFin,
            this.pageIndex, this.pageSize,
            this.ordenarPor, this.ascendente
        ).subscribe(res => {
            this.data = res.content;
            this.total = res.totalElements;
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
        this.svc.exportComprasClientesCsv(this.fechaInicio, this.fechaFin).subscribe(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'compras_clientes.csv';
            a.click();
            window.URL.revokeObjectURL(url);
        });
    }
}
