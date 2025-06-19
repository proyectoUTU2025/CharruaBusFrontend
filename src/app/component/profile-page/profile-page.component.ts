import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CompraService } from '../../services/compra.service';
import { AuthService } from '../../services/auth.service';
import {
    CompraDto,
    FiltroBusquedaCompraDto
} from '../../models/compra/compra.dto.model';
import { TipoEstadoCompra } from '../../models/tipo-estado-compra';
import { GenericListComponent } from '../shared/generic-list/generic-list.component';
import { DetalleCompraDialogComponent } from '../shared/detalle-compra-dialog/detalle-compra-dialog.component';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        GenericListComponent
    ],
    selector: 'app-profile-page',
    templateUrl: './profile-page.component.html',
    styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {
    compras: CompraDto[] = [];
    totalElements = 0;
    pageIndex = 0;
    pageSize = 20;

    filtro: FiltroBusquedaCompraDto = {
        estados: [],
        fechaDesde: undefined,
        fechaHasta: undefined,
        montoMin: undefined,
        montoMax: undefined
    };

    estadosOpts = Object.values(TipoEstadoCompra);
    selectedEstado: TipoEstadoCompra | '' = '';

    loading = false;
    error: string | null = null;

    columns = [
        { field: 'fechaCompra', header: 'Fecha' },
        { field: 'estado', header: 'Estado' },
        { field: 'precioActual', header: 'Total' },
        { field: 'acciones', header: 'Acciones' }
    ];

    constructor(
        private compraService: CompraService,
        private auth: AuthService,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        const id = this.auth.userId;
        if (id != null) {
            this.loadCompras(id);
        }
    }

    private loadCompras(clienteId: number) {
        this.loading = true;
        this.error = null;

        const filtroEnv = {
            ...this.filtro,
            fechaDesde: this.filtro.fechaDesde
                ? new Date(this.filtro.fechaDesde).toISOString()
                : undefined,
            fechaHasta: this.filtro.fechaHasta
                ? new Date(this.filtro.fechaHasta).toISOString()
                : undefined
        };

        this.compraService
            .getHistorialCliente(clienteId, filtroEnv, this.pageIndex, this.pageSize)
            .subscribe({
                next: resp => {
                    this.compras = resp.content;
                    this.totalElements = resp.totalElements;
                    this.loading = false;
                },
                error: () => {
                    this.error = 'Error al cargar historial';
                    this.loading = false;
                }
            });
    }

    onEstadoChange(): void {
        this.filtro.estados = this.selectedEstado ? [this.selectedEstado] : [];
        this.pageIndex = 0;
        const id = this.auth.userId;
        if (id != null) this.loadCompras(id);
    }

    onFilter(): void {
        if (
            this.filtro.fechaDesde &&
            this.filtro.fechaHasta &&
            this.filtro.fechaDesde > this.filtro.fechaHasta
        ) {
            this.error = 'Rango de fechas inválido';
            return;
        }
        this.pageIndex = 0;
        const id = this.auth.userId;
        if (id != null) this.loadCompras(id);
    }

    onPageChange(page: number): void {
        this.pageIndex = page;
        const id = this.auth.userId;
        if (id != null) this.loadCompras(id);
    }

    openDetalle(compraId: number) {
        this.dialog.open(DetalleCompraDialogComponent, {
            width: '600px',
            data: { compraId }
        });
    }
}
