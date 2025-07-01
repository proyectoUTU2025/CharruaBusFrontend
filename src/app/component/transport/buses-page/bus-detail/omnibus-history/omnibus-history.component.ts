import {
    Component, Input, OnChanges, SimpleChanges, ViewChild, inject
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { SharedModule } from '../../../../../shared/shared.module';
import { MaterialModule } from '../../../../../shared/material.module';
import { MatDialog } from '@angular/material/dialog';
import { AltaViajeExpresoComponent } from '../../../viajes-page/alta-viaje-expreso/alta-viaje-expreso.component';
import { AsignarMantenimientoComponent } from '../../../mantenimientos-page/asignar-mantenimiento/asignar-mantenimiento.component';
import { MovimientoOmnibusDto } from '../../../../../models/movimiento-omnibus/movimiento-omnibus-dto.model';
import { Page } from '../../../../../models';
import { BusService } from '../../../../../services/bus.service';
import { LocalidadService } from '../../../../../services/localidades.service';

@Component({
    standalone: true,
    selector: 'app-omnibus-history',
    imports: [
        SharedModule,
        MaterialModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        MatTableModule
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
        'id',
        'fechaHoraSalida',
        'fechaHoraLlegada',
        'origenNombre',
        'destinoNombre',
        'tipoMovimientoOmnibus'
    ];

    pageIndex = 0;
    pageSize = 5;

    localidadesMap: Record<number, string> = {};
    localidadesKeys: string[] = [];

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    private dialog = inject(MatDialog);
    private busService = inject(BusService);
    private localidadService = inject(LocalidadService);
    private fb = inject(FormBuilder);

    constructor() {
        this.filterForm = this.fb.group({
            fechaHoraSalida: [''],
            fechaHoraLlegada: [''],
            origenId: [''],
            destinoId: [''],
            tipoMovimientoOmnibus: ['']
        });
        this.loadLocalidades();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['busId']?.currentValue) {
            this.resetFilters();
            this.loadHistory();
        }
    }

    private loadLocalidades() {
        this.localidadService.getAll({}, 0, 1000).subscribe(resp => {
            this.localidadesMap = {};
            resp.content.forEach(loc => (this.localidadesMap[loc.id] = loc.nombre));
            this.localidadesKeys = Object.keys(this.localidadesMap);
        });
    }

    loadHistory(event?: PageEvent) {
        if (event) {
            this.pageIndex = event.pageIndex;
            this.pageSize = event.pageSize;
        }
        const raw = this.filterForm.value;
        const filtros: any = {};
        if (raw.fechaHoraSalida) filtros.fechaHoraSalida = raw.fechaHoraSalida;
        if (raw.fechaHoraLlegada) filtros.fechaHoraLlegada = raw.fechaHoraLlegada;
        if (raw.origenId) filtros.origenId = raw.origenId;
        if (raw.destinoId) filtros.destinoId = raw.destinoId;
        if (raw.tipoMovimientoOmnibus) filtros.tipos = [raw.tipoMovimientoOmnibus];

        this.busService
            .getTrips(this.busId, filtros, this.pageIndex, this.pageSize)
            .subscribe({
                next: resp => {
                    this.history = resp.content;
                    this.totalMovimientos = resp.page.totalElements;
                },
                error: err => console.error(err)
            });
    }

    onSearch() {
        this.pageIndex = 0;
        this.paginator.firstPage();
        this.loadHistory();
    }

    onClear() {
        this.resetFilters();
        this.onSearch();
    }

    private resetFilters() {
        this.filterForm.reset({
            fechaHoraSalida: '',
            fechaHoraLlegada: '',
            origenId: '',
            destinoId: '',
            tipoMovimientoOmnibus: ''
        });
    }

    getNombreLocalidad(id: number): string {
        return this.localidadesMap[id] || '';
    }

    abrirAltaViajeExpreso() {
        const ref = this.dialog.open(AltaViajeExpresoComponent, {
            width: '600px', data: { omnibusId: this.busId }
        });
        ref.afterClosed().subscribe(res => {
            if (res === true || res === 'viajeRegistrado') {
                this.loadHistory();
            }
        });
    }

    abrirAsignarMantenimiento() {
        const ref = this.dialog.open(AsignarMantenimientoComponent, {
            width: '600px', data: { omnibusId: this.busId }
        });
        ref.afterClosed().subscribe(res => {
            if (res === 'mantenimientoCreado') {
                this.loadHistory();
            }
        });
    }
}
