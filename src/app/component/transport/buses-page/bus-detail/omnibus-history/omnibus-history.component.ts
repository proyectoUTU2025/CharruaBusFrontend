import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { MaterialModule } from '../../../../../shared/material.module';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MovimientoOmnibusDto } from '../../../../../models/movimiento-omnibus/movimiento-omnibus-dto.model';
import { Page } from '../../../../../models';
import { BusService } from '../../../../../services/bus.service';
import { LocalidadService } from '../../../../../services/localidades.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
    standalone: true,
    selector: 'app-omnibus-history',
    imports: [
        SharedModule,
        MaterialModule
    ],
    templateUrl: './omnibus-history.component.html',
    styleUrls: ['./omnibus-history.component.scss']
})
export class OmnibusHistoryComponent implements OnChanges {
    @Input() busId!: number;
    filterForm: FormGroup;
    history: MovimientoOmnibusDto[] = [];
    totalMovimientos = 0;
    columns = [
        'id', 'fechaHoraSalida', 'fechaHoraLlegada',
        'origenNombre', 'destinoNombre', 'tipoMovimientoOmnibus'
    ];
    pageIndex = 0;
    pageSize = 5;

    @ViewChild('paginator') paginator!: MatPaginator;

    localidades: any[] = [];
    localidadesMap: Record<number, string> = {};

    constructor(
        private fb: FormBuilder,
        private busService: BusService,
        private localidadService: LocalidadService
    ) {
        this.filterForm = this.fb.group({
            fechaHoraSalida: [''],
            origenId: [''],
            destinoId: [''],
            tipoMovimientoOmnibus: ['']
        });
        this.cargarLocalidades();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['busId']?.currentValue) {
            this.pageIndex = 0;
            this.loadHistory(0, this.pageSize);
        }
    }

    cargarLocalidades() {
        this.localidadService.getAll({}, 0, 1000).subscribe({
            next: (resp) => {
                if (resp.content) {
                    this.localidades = resp.content;
                    for (const l of resp.content) {
                        this.localidadesMap[l.id] = l.nombre;
                    }
                }
            }
        });
    }

    loadHistory(page: number, size: number) {
        if (!this.busId || isNaN(this.busId)) return;
        const raw = this.filterForm.value;
        const filtros: any = {};
        if (raw.fechaHoraSalida) filtros.fechaHoraSalida = raw.fechaHoraSalida;
        if (raw.origenId) filtros.origenId = raw.origenId;
        if (raw.destinoId) filtros.destinoId = raw.destinoId;
        if (raw.tipoMovimientoOmnibus) filtros.tipos = [raw.tipoMovimientoOmnibus];

        this.busService.getTrips(this.busId, filtros, page, size).subscribe({
            next: (resp: Page<MovimientoOmnibusDto>) => {
                this.history = resp.content;
                this.totalMovimientos = resp.totalElements;
            },
            error: err => {
                console.error('Error cargando historial de movimientos:', err);
            }
        });
    }

    onSearch() {
        this.pageIndex = 0;
        this.paginator.firstPage();
        this.loadHistory(this.pageIndex, this.pageSize);
    }

    onClear() {
        this.filterForm.reset({
            fechaHoraSalida: '',
            origenId: '',
            destinoId: '',
            tipoMovimientoOmnibus: ''
        });
        this.onSearch();
    }

    onPageChange(event: PageEvent) {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadHistory(this.pageIndex, this.pageSize);
    }

    getNombreLocalidad(id: number, movimiento?: MovimientoOmnibusDto): string {
        if (!id || (movimiento && movimiento.tipoMovimientoOmnibus === 'MANTENIMIENTO')) return '';
        return this.localidadesMap[id] || id.toString() || '';
    }
}
