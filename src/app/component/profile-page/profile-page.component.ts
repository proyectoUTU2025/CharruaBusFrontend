import { TipoEstadoCompra } from '../../models/tipo-estado-compra';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompraService } from '../../services/compra.service';
import { LoginService } from '../../services/login.service';
import { CompraDto, FiltroBusquedaCompraDto } from '../../models';
import { GenericListComponent } from '../../shared/generic-list/generic-list.component';

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, GenericListComponent],
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


    selectedEstado: TipoEstadoCompra | '' = '';


    estadosOpts = Object.values(TipoEstadoCompra);

    loading = false;
    error: string | null = null;

    columns = [
        { field: 'fechaCompra', header: 'Fecha' },
        { field: 'estado', header: 'Estado' },
        { field: 'precioActual', header: 'Total' }
    ];

    clienteId: number | null = null;

    constructor(
        private compraService: CompraService,
        private loginService: LoginService
    ) { }

    ngOnInit(): void {
        this.clienteId = this.loginService.id;
        this.loadCompras();
    }


    onEstadoChange(): void {
        this.filtro.estados = this.selectedEstado ? [this.selectedEstado] : [];
        this.pageIndex = 0;
        this.loadCompras();
    }

    loadCompras(): void {
        if (this.clienteId == null) return;
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
            .getHistorialCliente(this.clienteId, filtroEnv, this.pageIndex, this.pageSize)
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
        this.loadCompras();
    }

    onPageChange(page: number): void {
        this.pageIndex = page;
        this.loadCompras();
    }
}
