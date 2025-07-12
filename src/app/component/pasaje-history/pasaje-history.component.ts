import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PasajeService } from '../../services/pasaje.service';
import { AuthService } from '../../services/auth.service';
import { LocalidadService } from '../../services/localidades.service';
import { FiltroBusquedaPasajeDto } from '../../models/pasajes/filtro-busqueda-pasaje.dto';
import { TipoEstadoPasaje } from '../../models/pasajes/tipo-estado-pasaje.enum';
import { PasajeDto } from '../../models/pasajes/pasaje-dto.model';
import { DetallePasajeCompletoDialogComponent } from '../shared/detalle-pasaje-completo-dialog/detalle-pasaje-completo-dialog.component';
import { MaterialUtilsService } from '../../shared/material-utils.service';
import { Router } from '@angular/router';

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
import { LocalidadNombreDepartamentoDto } from '../../models/localidades/localidad-nombre-departamento-dto.model';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
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
        LoadingSpinnerComponent
    ],
    selector: 'app-pasaje-history',
    templateUrl: './pasaje-history.component.html',
    styleUrls: ['./pasaje-history.component.scss']
})
export class PasajeHistoryComponent implements OnInit {
    
    totalElements = 0;
    pageSize = 10;
    pageIndex = 0;
    loading = false;
    error: string | null = null;
    
    filterForm: FormGroup;
    estadosOpts = Object.values(TipoEstadoPasaje);
    
    todasLasLocalidades: LocalidadNombreDepartamentoDto[] = [];
    
    displayedColumns: string[] = ['fecha', 'numeroAsiento', 'paradaOrigen', 'paradaDestino', 'estadoPasaje', 'subtotal', 'acciones'];
    pasajes: PasajeDto[] = [];
    
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    private clienteId!: number;

    constructor(
        private fb: FormBuilder,
        private pasajeService: PasajeService,
        private auth: AuthService,
        private localidadService: LocalidadService,
        private dialog: MatDialog,
        private materialUtils: MaterialUtilsService,
        private router: Router,
    ) {
        this.filterForm = this.fb.group({
            fechaDesde: [null],
            fechaHasta: [null],
            origenId: [null],
            destinoId: [null],
            estado: ['']
        });
    }

    ngOnInit(): void {
        this.clienteId = this.auth.userId!;
        this.localidadService.getAllFlat()
            .subscribe(list => this.todasLasLocalidades = list);

        this.filterForm.get('fechaDesde')?.valueChanges.subscribe(value => {
            const fechaHastaControl = this.filterForm.get('fechaHasta');
            if (fechaHastaControl?.value && value && new Date(fechaHastaControl.value) < new Date(value)) {
                fechaHastaControl.setValue(null);
            }
        });

        this.loadPasajes();
    }

    get fechaDesde() {
        return this.filterForm.get('fechaDesde')?.value;
    }

    onFilter(): void {
        const formValue = this.filterForm.value;
        if (formValue.fechaDesde && formValue.fechaHasta &&
            new Date(formValue.fechaDesde) > new Date(formValue.fechaHasta)) {
            this.materialUtils.showError('El rango de fechas es inválido.');
            return;
        }
        this.pageIndex = 0;
        this.loadPasajes();
    }

    limpiarFiltros(): void {
        this.filterForm.reset({
            fechaDesde: null,
            fechaHasta: null,
            origenId: null,
            destinoId: null,
            estado: ''
        });
        this.onFilter();
    }

    handlePageEvent(event: PageEvent) {
        this.pageSize = event.pageSize;
        this.pageIndex = event.pageIndex;
        this.loadPasajes();
    }

    openDetalle(pasajeId: number): void {
        const dialogRef = this.dialog.open(DetallePasajeCompletoDialogComponent, {
            width: '600px',
            maxWidth: '95vw',
            data: { pasajeId: pasajeId },
            disableClose: true,
            autoFocus: false,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.action === 'VER_COMPRA' && result.compraId) {
                this.router.navigate(['/compra', result.compraId]);
            } else {
                this.loadPasajes();
            }
        });
    }

    getBadgeClass(estado: string): string {
        switch (estado) {
            case 'CONFIRMADO': return 'badge-confirmado';
            case 'PENDIENTE': return 'badge-pendiente';
            case 'CANCELADO': return 'badge-cancelado';
            case 'DEVUELTO': return 'badge-devuelto';
            default: return '';
        }
    }

    formatToTitleCase(text: string): string {
        if (!text) return '';
        return text.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, s => s.toUpperCase());
    }

    private loadPasajes(): void {
        this.loading = true;
        this.error = null;

        const formValue = this.filterForm.value;
        const filtroEnv: FiltroBusquedaPasajeDto = {
            estados: formValue.estado ? [formValue.estado] : [],
            fechaDesde: formValue.fechaDesde
                ? new Date(formValue.fechaDesde).toISOString().split('T')[0]
                : undefined,
            fechaHasta: formValue.fechaHasta
                ? new Date(formValue.fechaHasta).toISOString().split('T')[0]
                : undefined,
            origenId: formValue.origenId || undefined,
            destinoId: formValue.destinoId || undefined,
        };

        this.pasajeService
            .getHistorialPasajes(this.clienteId, filtroEnv, this.pageIndex, this.pageSize)
            .subscribe({
                next: (resp: any) => {
                    this.pasajes = resp.content;
                    this.totalElements = resp.page.totalElements;
                    this.pageIndex = resp.page.number;
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                    this.pasajes = [];
                }
            });
    }
}
