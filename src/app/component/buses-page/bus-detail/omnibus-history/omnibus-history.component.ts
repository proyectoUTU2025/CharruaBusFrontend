import { Component, Input, ViewChild, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MovimientoOmnibusDto } from '../../../../models/movimiento-omnibus/movimiento-omnibus-dto.model';
import { Page } from '../../../../models/page.model';
import { BusService } from '../../../../services/bus.service';
import { LocalidadService } from '../../../../services/localidades.service';

@Component({
    selector: 'app-omnibus-history',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule
    ],
    templateUrl: './omnibus-history.component.html',
    styleUrls: ['./omnibus-history.component.scss']
})
export class OmnibusHistoryComponent implements OnChanges {
    @Input() busId!: number;

    filterForm: FormGroup;
    history: MovimientoOmnibusDto[] = [];
    totalMovimientos = 0;
    columns: string[] = [
        'id',
        'fechaHoraSalida',
        'fechaHoraLlegada',
        'origenNombre',
        'destinoNombre',
        'tipoMovimientoOmnibus'
    ];

    pageIndex = 0;
    pageSize = 5;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    localidades: any[] = [];
    localidadesMap: { [key: number]: string } = {};

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
        if ('busId' in changes && this.busId && !isNaN(this.busId)) {
            this.pageIndex = 0;
            this.loadHistory(this.pageIndex, this.pageSize);
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
