import {
    Component,
    Input,
    OnInit,
    OnDestroy,
    ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../../../../shared/shared.module';
import { MaterialModule } from '../../../../../shared/material.module';
import { MovimientoOmnibusDto } from '../../../../../models/movimiento-omnibus/movimiento-omnibus-dto.model';
import { Page } from '../../../../../models';
import { BusService } from '../../../../../services/bus.service';
import { LocalidadService } from '../../../../../services/localidades.service';
import { Subject, takeUntil } from 'rxjs';

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
        MatTableModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './omnibus-history.component.html',
    styleUrls: ['./omnibus-history.component.scss']
})
export class OmnibusHistoryComponent implements OnInit, OnDestroy {
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
    isLoading = true;

    horasDisponibles: string[] = [];

    localidadesMap: Record<number, string> = {};
    localidadesKeys: string[] = [];

    private destroy$ = new Subject<void>();
    minDateForLlegada: Date | null = null;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(
        private fb: FormBuilder,
        private busService: BusService,
        private localidadService: LocalidadService
    ) {
        this.filterForm = this.fb.group(
            {
                fechaHoraSalida: [null],
                horaSalida: [''],
                fechaHoraLlegada: [null],
                horaLlegada: [''],
                origenId: [''],
                destinoId: [''],
                tipoMovimientoOmnibus: ['']
            },
            { validators: this.dateRangeValidator }
        );
        this.loadLocalidades();
    }

    ngOnInit(): void {
        this.loadHistory();
        this.loadLocalidades();
        this.setupDateFilters();
        this.generarHorasDisponibles();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    setupDateFilters(): void {
        this.filterForm.get('fechaHoraSalida')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(value => {
                this.minDateForLlegada = value ? new Date(value) : null;

                const fechaLlegadaControl = this.filterForm.get('fechaHoraLlegada');
                if (fechaLlegadaControl?.value && this.minDateForLlegada && fechaLlegadaControl.value < this.minDateForLlegada) {
                    fechaLlegadaControl.setValue(null);
                }
            });
    }

    private buildDateTime(fecha: Date | null, hora: string, finDelDia: boolean = false): string | undefined {
        if (!fecha) return undefined;

        let hh: number, mm: number, ss: number;
        if (hora) {
          [hh, mm] = hora.split(':').map(Number);
          ss = 0;
        } else {
          [hh, mm, ss] = finDelDia ? [23, 59, 59] : [0, 0, 0];
        }

        const dt = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), hh, mm, ss);

        const year = dt.getFullYear();
        const month = (dt.getMonth() + 1).toString().padStart(2, '0');
        const day = dt.getDate().toString().padStart(2, '0');
        const hours = dt.getHours().toString().padStart(2, '0');
        const minutes = dt.getMinutes().toString().padStart(2, '0');
        const seconds = dt.getSeconds().toString().padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }

    private generarHorasDisponibles(): void {
        this.horasDisponibles = [];
        for (let hora = 0; hora < 24; hora++) {
            for (let minuto = 0; minuto < 60; minuto += 5) {
                const horaStr = hora.toString().padStart(2, '0');
                const minutoStr = minuto.toString().padStart(2, '0');
                this.horasDisponibles.push(`${horaStr}:${minutoStr}`);
            }
        }
    }

    private loadLocalidades(): void {
        this.localidadService.getAllFlat().subscribe(list => {
            this.localidadesMap = {};
            list.forEach(loc => (this.localidadesMap[loc.id] = loc.nombreConDepartamento));
            this.localidadesKeys = Object.keys(this.localidadesMap);
        });
    }

    loadHistory(event?: PageEvent) {
        this.isLoading = true;
        if (event) {
            this.pageIndex = event.pageIndex;
            this.pageSize = event.pageSize;
        }

        const raw = this.filterForm.value;
        const filtros: any = {};

        filtros.fechaHoraSalida = this.buildDateTime(raw.fechaHoraSalida, raw.horaSalida);
        filtros.fechaHoraLlegada = this.buildDateTime(raw.fechaHoraLlegada, raw.horaLlegada);

        if (raw.origenId) filtros.origenId = raw.origenId;
        if (raw.destinoId) filtros.destinoId = raw.destinoId;
        if (raw.tipoMovimientoOmnibus) filtros.tipos = [raw.tipoMovimientoOmnibus];

        this.busService
            .getTrips(this.busId, filtros, this.pageIndex, this.pageSize)
            .subscribe({
                next: resp => {
                    this.history = resp.content;
                    this.totalMovimientos = resp.page.totalElements;
                    this.isLoading = false;
                },
                error: () => {
                    this.history = [];
                    this.totalMovimientos = 0;
                    this.isLoading = false;
                }
            });
    }

    onSearch() {
        if (this.filterForm.invalid) {
            return;
        }
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
            horaSalida: '',
            fechaHoraLlegada: '',
            horaLlegada: '',
            origenId: '',
            destinoId: '',
            tipoMovimientoOmnibus: ''
        });
    }

    private dateRangeValidator = (form: AbstractControl): ValidationErrors | null => {
        const fechaSalida: Date | null = form.get('fechaHoraSalida')?.value ?? null;
        const horaSalida: string = form.get('horaSalida')?.value ?? '';
        const fechaLlegada: Date | null = form.get('fechaHoraLlegada')?.value ?? null;
        const horaLlegada: string = form.get('horaLlegada')?.value ?? '';

        if (!fechaSalida || !fechaLlegada) {
            return null;
        }

        const salidaStr = this.buildDateTime(fechaSalida, horaSalida);
        const llegadaStr = this.buildDateTime(fechaLlegada, horaLlegada);

        if (!salidaStr || !llegadaStr) {
            return null;
        }

        const salida = new Date(salidaStr).getTime();
        const llegada = new Date(llegadaStr).getTime();

        return llegada < salida ? { dateRangeInvalid: true } : null;
    };
}
