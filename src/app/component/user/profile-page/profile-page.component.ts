// CharruaBusFrontend/src/app/component/profile-page/profile-page.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ReactiveFormsModule,
    FormBuilder,
    FormGroup
} from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { CompraService } from '../../../services/compra.service';
import { CompraDto } from '../../../models/compra.dto';
import { FiltroBusquedaCompraDto } from '../../../models/filtro-busqueda-compra.dto';

@Component({
    standalone: true,
    selector: 'app-profile-page',
    templateUrl: './profile-page.component.html',
    styleUrls: ['./profile-page.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ]
})
export class ProfilePageComponent implements OnInit {
    filterForm!: FormGroup;
    compras: CompraDto[] = [];
    page = 0;
    size = 10;
    totalElements = 0;

    constructor(
        private fb: FormBuilder,
        private compraService: CompraService
    ) { }

    ngOnInit(): void {
        this.filterForm = this.fb.group({
            fechaDesde: [null],
            fechaHasta: [null]
        });
        this.loadCompras();
    }

    private loadCompras(): void {
        const filtro: FiltroBusquedaCompraDto = {
            fechaDesde: this.filterForm.value.fechaDesde,
            fechaHasta: this.filterForm.value.fechaHasta
        };
        const clienteId = Number(localStorage.getItem('clienteId'));
        this.compraService
            .getHistorial(clienteId, filtro, this.page, this.size)
            .then(p => {
                this.compras = p.content;
                this.totalElements = p.totalElements;
            });
    }

    applyFilter(): void {
        this.page = 0;
        this.loadCompras();
    }

    onPageChange(newPage: number): void {
        this.page = newPage;
        this.loadCompras();
    }
}
