import { LocalidadService } from '../../../services/localidades.service';
import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { MaterialModule } from '../../../shared/material.module';
import {
    ReactiveFormsModule,
    FormBuilder,
    FormGroup
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { GenericListComponent } from '../../../shared/generic-list/generic-list.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialUtilsService } from '../../../shared/material-utils.service';

import { BusService } from '../../../services/bus.service';
import { BusDto } from '../../../models';
import { LocalidadDto } from '../../../models/localidades/localidades-dto.model';
import { Page } from '../../../models';
import { BulkResponseDto } from '../../../models/bulk/bulk-response.dto';
import { BulkLineResult } from '../../../models/bulk/bulk-line-result.dto';

import { AddBusDialogComponent } from './dialogs/add-bus-dialog/add-bus-dialog.component';
import { BulkUploadBusDialogComponent } from './dialogs/bulk-upload-bus-dialog/bulk-upload-bus-dialog.component';
import { BulkErrorsDialogComponent } from './dialogs/bulk-errors-dialog/bulk-errors-dialog.component';
import { ConfirmDialogComponent } from '../viajes-page/alta-viaje-expreso/dialogs/confirm-warning-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-buses-page',
    standalone: true,
    imports: [
        SharedModule,
        MaterialModule,
        ReactiveFormsModule,
        RouterModule,
        GenericListComponent,
    ],
    templateUrl: './buses-page.component.html',
    styleUrls: ['./buses-page.component.scss']
})
export class BusesPageComponent implements OnInit {
    filterForm: FormGroup;
    buses: BusDto[] = [];
    totalElements = 0;
    pageIndex = 0;
    pageSize = 5;
    columns = ['id', 'matricula', 'capacidad', 'activo', 'acciones'];

    localidades: LocalidadDto[] = [];

    constructor(
        private fb: FormBuilder,
        private busService: BusService,
        private localidadService: LocalidadService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private router: Router,
        private materialUtils: MaterialUtilsService
    ) {
        this.filterForm = this.fb.group({
            matricula: [''],
            localidadId: [null],
            minAsientos: [null],
            maxAsientos: [null],
            activo: [null]
        });
    }

    ngOnInit(): void {
        this.localidadService.getAll({}, 0, 1000).subscribe({
            next: page => this.localidades = page.content,
            error: err => console.error('Error cargando localidades:', err)
        });
        this.loadBuses(0, this.pageSize);
    }

    loadBuses(pageIndex: number, pageSize: number): void {
        const filtro = this.filterForm.value;
        this.busService.getAll(filtro, pageIndex, pageSize)
            .then((resp: Page<BusDto>) => {
                this.buses = resp.content;
                this.totalElements = resp.page.totalElements;
                this.pageIndex = pageIndex;
                this.pageSize = pageSize;
            })
            .catch(error => console.error('Error al traer ómnibus:', error));
    }

    onSearch(): void {
        this.loadBuses(0, this.pageSize);
    }

    onClear(): void {
        this.filterForm.reset({
            matricula: '', localidadId: null,
            minAsientos: null, maxAsientos: null, activo: null
        });
        this.onSearch();
    }

    openBulkUpload(): void {
        this.dialog.open(BulkUploadBusDialogComponent, { width: '600px' })
            .afterClosed()
            .subscribe((file: File | undefined) => {
                if (!file) return;
                this.busService.bulkUpload(file)
                    .then((resp: BulkResponseDto) => {
                        const errs = resp.results.filter((r: BulkLineResult) => !r.creado);
                        if (errs.length) {
                            this.dialog.open(BulkErrorsDialogComponent, {
                                width: '600px',
                                data: errs
                            });
                        } else {
                            this.loadBuses(this.pageIndex, this.pageSize);
                        }
                    })
                    .catch(console.error);
            });
    }

    add(): void {
        this.dialog.open(AddBusDialogComponent, {
            width: '450px', maxHeight: '95vh'
        })
            .afterClosed()
            .subscribe(alta => {
                if (alta) this.loadBuses(0, this.pageSize);
            });
    }

    cambiarEstado(bus: BusDto): void {
        const nuevo = !bus.activo;
        const msg = nuevo
            ? `¿Activar ómnibus "${bus.matricula}"?`
            : `¿Inactivar ómnibus "${bus.matricula}"?`;
        this.dialog.open(ConfirmDialogComponent, {
            data: { title: 'Confirmar', message: msg }
        })
            .afterClosed()
            .subscribe(ok => {
                if (!ok) return;
                this.busService.cambiarEstado(bus.id, nuevo)
                    .then(res => {
                        this.materialUtils.showSuccess(res.message);
                        this.loadBuses(this.pageIndex, this.pageSize);
                    })
                    .catch(err => {
                        const m = err.error?.message || 'Error al cambiar estado';
                        this.materialUtils.showError(m, { duration: 4000 });
                        this.loadBuses(this.pageIndex, this.pageSize);
                    });
            });
    }

    onAction(row: BusDto, action: string): void {
        switch (action) {
            case 'view':
                this.router.navigate(['/omnibus', row.id]);
                break;
            case 'toggle':
                this.cambiarEstado(row);
                break;
        }
    }
}
