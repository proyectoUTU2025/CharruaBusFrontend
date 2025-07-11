import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
import { merge, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Page } from '../../models/api';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
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

    filterForm: FormGroup;
    maxDate: Date;
    totalElements = 0;
    pageSize = 10;
    pageIndex = 0;
    loading = false;
    error: string | null = null;

    estadosOpts = Object.values(TipoEstadoCompra);

    displayedColumns: string[] = ['fechaCompra', 'cantidadPasajes', 'precioActual', 'estado', 'acciones'];
    compras: CompraDto[] = [];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    private clienteId!: number;

    constructor(
        private fb: FormBuilder,
        private compraService: CompraService,
        private auth: AuthService,
        private dialog: MatDialog,
        private materialUtils: MaterialUtilsService,
        private router: Router,
    ) {
        this.maxDate = new Date();
        this.filterForm = this.fb.group({
            fechaDesde: [null],
            fechaHasta: [null],
            montoMin: [null],
            montoMax: [null],
            estado: [null],
        });
    }

    ngOnInit(): void {
        this.clienteId = this.auth.userId!;
        this.loadCompras();
        this.subscribeToDateChanges();
    }

    private subscribeToDateChanges(): void {
        this.filterForm.get('fechaDesde')?.valueChanges.subscribe(value => {
            const fechaHastaControl = this.filterForm.get('fechaHasta');
            if (value && fechaHastaControl?.value && new Date(value) > new Date(fechaHastaControl.value)) {
                fechaHastaControl.setValue(null);
            }
        });
    }
    
    get fechaDesde(): Date | null {
        return this.filterForm.get('fechaDesde')?.value;
    }

    ngAfterViewInit(): void {
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                tap(() => this.loadCompras())
            )
            .subscribe();
    }

    onFilter(): void {
        const values = this.filterForm.value;
        if ((values.montoMin || 0) > (values.montoMax || Infinity)) {
            this.materialUtils.showError('El rango de montos es inválido.');
            return;
        }
        this.paginator.pageIndex = 0;
        this.loadCompras();
    }

    limpiarFiltros(): void {
        this.filterForm.reset();
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

        const formValues = this.filterForm.value;
        const filtro: FiltroBusquedaCompraDto = {
            estados: formValues.estado ? [formValues.estado] : [],
            fechaDesde: formValues.fechaDesde ? new Date(formValues.fechaDesde).toISOString().split('T')[0] : undefined,
            fechaHasta: formValues.fechaHasta ? new Date(formValues.fechaHasta).toISOString().split('T')[0] : undefined,
            montoMin: formValues.montoMin,
            montoMax: formValues.montoMax,
        };

        const sortActive = this.sort ? this.sort.active : 'fechaCompra';
        const sortDirection = this.sort ? this.sort.direction : 'desc';
        const sortParam = `${sortActive},${sortDirection}`;

        this.compraService
            .getHistorialCliente(this.clienteId, filtro, this.paginator ? this.paginator.pageIndex : 0, this.paginator ? this.paginator.pageSize : 10, sortParam)
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