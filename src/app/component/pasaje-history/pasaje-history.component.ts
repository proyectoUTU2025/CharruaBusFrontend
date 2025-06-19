import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PasajeService } from '../../services/pasaje.service';
import { AuthService } from '../../services/auth.service';
import { LocalidadService } from '../../services/localidades.service';
import { FiltroBusquedaPasajeDto } from '../../models/pasajes/filtro-busqueda-pasaje.dto';
import { TipoEstadoPasaje } from '../../models/pasajes/tipo-estado-pasaje.enum';
import { PasajeDto } from '../../models/pasajes/pasaje.dto';
import { GenericListComponent } from '../shared/generic-list/generic-list.component';
import { DetallePasajeDialogComponent } from '../shared/detalle-pasaje-dialog/detalle-pasaje-dialog.component';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        GenericListComponent
    ],
    selector: 'app-pasaje-history',
    templateUrl: './pasaje-history.component.html',
    styleUrls: ['./pasaje-history.component.scss']
})
export class PasajeHistoryComponent implements OnInit {
    pasajes: PasajeDto[] = [];
    totalElements = 0;
    pageIndex = 0;
    pageSize = 20;
    loading = false;
    error: string | null = null;

    filtro: FiltroBusquedaPasajeDto = {
        estados: [],
        fechaDesde: undefined,
        fechaHasta: undefined,
        origenId: undefined,
        destinoId: undefined
    };
    selectedEstado: TipoEstadoPasaje | '' = '';
    estadosOpts = Object.values(TipoEstadoPasaje);

    localidadesOrigen: { id: number; nombre: string }[] = [];
    localidadesDestino: { id: number; nombre: string }[] = [];

    columns = [
        { field: 'fecha', header: 'Fecha Salida' },
        { field: 'paradaOrigen', header: 'Origen' },
        { field: 'paradaDestino', header: 'Destino' },
        { field: 'numeroAsiento', header: 'Asiento' },
        { field: 'estadoPasaje', header: 'Estado' },
        { field: 'subtotal', header: 'Subtotal' },
        { field: 'acciones', header: 'Acciones' }
    ];

    clienteId: number | null = null;

    constructor(
        private pasajeService: PasajeService,
        private auth: AuthService,
        private localidadService: LocalidadService,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.clienteId = this.auth.userId;
        this.localidadService.getLocalidadesOrigenValidas()
            .subscribe(list => this.localidadesOrigen = list);
        this.loadPasajes();
    }

    onOrigenChange(origenId: number): void {
        this.filtro.origenId = origenId || undefined;
        this.localidadService.getDestinosPosibles(origenId)
            .subscribe(list => this.localidadesDestino = list);
    }

    onEstadoChange(): void {
        this.filtro.estados = this.selectedEstado ? [this.selectedEstado] : [];
        this.pageIndex = 0;
        this.loadPasajes();
    }

    onFilter(): void {
        this.error = null;
        if (this.filtro.fechaDesde && this.filtro.fechaHasta &&
            this.filtro.fechaDesde > this.filtro.fechaHasta) {
            this.error = 'Rango de fechas inválido';
            return;
        }
        this.pageIndex = 0;
        this.loadPasajes();
    }

    onPageChange(page: number): void {
        this.pageIndex = page;
        this.loadPasajes();
    }

    openDetalle(id: number): void {
        this.dialog.open(DetallePasajeDialogComponent, {
            width: '600px',
            data: { pasajeId: id }
        });
    }

    private loadPasajes(): void {
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

        this.pasajeService
            .getHistorialPasajes(this.clienteId, filtroEnv, this.pageIndex, this.pageSize)
            .subscribe({
                next: resp => {
                    this.pasajes = resp.content;
                    this.totalElements = resp.totalElements;
                    this.loading = false;
                },
                error: () => {
                    this.error = 'Error al cargar historial de pasajes';
                    this.loading = false;
                }
            });
    }
}
