import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CompraService } from '../../services/compra.service';
import { AuthService } from '../../services/auth.service';
import { FiltroBusquedaCompraDto, CompraDto } from '../../models';
import { TipoEstadoCompra } from '../../models/tipo-estado-compra';
import { MaterialUtilsService } from '../../shared/material-utils.service';

// Imports de Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatSnackBarModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule,
        MatTableModule,
        MatPaginatorModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        LoadingSpinnerComponent,
        MatSortModule
    ],
    selector: 'app-compras-history',
    templateUrl: './compras-history.component.html',
    styleUrls: ['./compras-history.component.scss']
})
export class ComprasHistoryComponent implements OnInit, AfterViewInit {

    totalElements = 0;
    pageSize = 10;
    pageIndex = 0;
    loading = false;
    error: string | null = null;

    filtro: FiltroBusquedaCompraDto = this.getInitialFiltro();
    selectedEstado: TipoEstadoCompra | '' = '';
    estadosOpts = Object.values(TipoEstadoCompra);

    displayedColumns: string[] = ['fechaCompra', 'cantidadPasajes', 'precioActual', 'estado', 'acciones'];
    compras: CompraDto[] = [];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    private clienteId!: number;

    constructor(
        private compraService: CompraService,
        private auth: AuthService,
        private dialog: MatDialog,
        private materialUtils: MaterialUtilsService,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.clienteId = this.auth.userId!;
        this.loadCompras();
    }

    ngAfterViewInit(): void {
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                tap(() => this.loadCompras())
            )
            .subscribe();
    }

    getInitialFiltro(): FiltroBusquedaCompraDto {
        return {
            estados: [],
            fechaDesde: undefined,
            fechaHasta: undefined,
            montoMin: undefined,
            montoMax: undefined
        };
    }

    onEstadoChange(): void {
        this.filtro.estados = this.selectedEstado ? [this.selectedEstado] : [];
    }

    onFilter(): void {
        this.error = null;
        if (this.filtro.fechaDesde && this.filtro.fechaHasta &&
            new Date(this.filtro.fechaDesde) > new Date(this.filtro.fechaHasta)) {
            this.error = 'Rango de fechas inválido';
            return;
        }
        if ((this.filtro.montoMin || 0) > (this.filtro.montoMax || Infinity)) {
            this.error = 'Rango de montos inválido';
            return;
        }
        this.paginator.pageIndex = 0;
        this.loadCompras();
    }

    limpiarFiltros(): void {
        this.filtro = this.getInitialFiltro();
        this.selectedEstado = '';
        this.paginator.pageIndex = 0;
        this.sort.active = 'fechaCompra';
        this.sort.direction = 'desc';
        this.loadCompras();
    }

    openDetalle(compraId: number): void {
        this.router.navigate(['/compra', compraId]);
    }

    getBadgeClass(estado: string): string {
        switch (estado) {
            case 'COMPLETADA': return 'badge-confirmado';
            case 'PENDIENTE': return 'badge-pendiente';
            case 'CANCELADA': return 'badge-cancelado';
            case 'REEMBOLSADA': return 'badge-devuelto';
            case 'PARCIALMENTE_REEMBOLSADA': return 'badge-parcialmente-reembolsada';
            default: return '';
        }
    }

    formatToTitleCase(text: string): string {
        if (!text) return '';
        return text.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, s => s.toUpperCase());
    }

    formatStateForFilter(text: string): string {
        if (!text) return '';
        return text.replace(/_/g, ' ');
    }

    private loadCompras(): void {
        this.loading = true;
        this.error = null;

        const filtroEnv: FiltroBusquedaCompraDto = {
            ...this.filtro,
            fechaDesde: this.filtro.fechaDesde
                ? new Date(this.filtro.fechaDesde).toISOString().split('T')[0]
                : undefined,
            fechaHasta: this.filtro.fechaHasta
                ? new Date(this.filtro.fechaHasta).toISOString().split('T')[0]
                : undefined
        };

        const sortActive = this.sort ? this.sort.active : 'fechaCompra';
        const sortDirection = this.sort ? this.sort.direction : 'desc';
        const sortParam = `${sortActive},${sortDirection}`;

        this.compraService
            .getHistorialCliente(this.clienteId, filtroEnv, this.paginator ? this.paginator.pageIndex : 0, this.paginator ? this.paginator.pageSize : 10, sortParam)
            .subscribe({
                next: (resp) => {
                    this.compras = resp.content;
                    this.totalElements = resp.page.totalElements;
                    this.pageIndex = resp.page.number;
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                    this.compras = [];
                    this.materialUtils.showError('Error al cargar el historial de compras.');
                }
            });
    }
} 