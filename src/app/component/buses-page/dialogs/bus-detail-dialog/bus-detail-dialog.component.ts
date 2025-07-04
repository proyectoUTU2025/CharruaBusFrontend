import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../../../shared/shared.module';
import { MaterialModule } from '../../../../shared/material.module';
import { NgIf } from '@angular/common';
import { BusService } from '../../../../services/bus.service';
import { BusDto } from '../../../../models/buses';
import { OmnibusHistoryComponent } from './omnibus-history/omnibus-history.component';
import { AsignarMantenimientoComponent } from '../asignar-mantenimiento/asignar-mantenimiento.component';
import { AltaViajeExpresoComponent } from '../alta-viaje-expreso/alta-viaje-expreso.component';

@Component({
    standalone: true,
    selector: 'app-bus-detail-dialog',
    imports: [
        SharedModule,
        MaterialModule,
        NgIf,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        OmnibusHistoryComponent,
        AsignarMantenimientoComponent,
        AltaViajeExpresoComponent
    ],
    templateUrl: './bus-detail-dialog.component.html',
    styleUrls: ['./bus-detail-dialog.component.scss']
})
export class BusDetailDialogComponent implements OnInit {
    busId: number;
    bus?: BusDto;
    loading = true;
    error = '';
    @ViewChild(OmnibusHistoryComponent) historyComponent!: OmnibusHistoryComponent;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { busId: number },
        private dialogRef: MatDialogRef<BusDetailDialogComponent>,
        private busService: BusService,
        private dialog: MatDialog
    ) {
        this.busId = data.busId;
    }

    ngOnInit() {
        this.loadBus();
    }

    private loadBus() {
        this.loading = true;
        this.error = '';
        this.busService.getById(this.busId).subscribe({
            next: b => { this.bus = b; this.loading = false; },
            error: () => { this.error = 'No se pudo cargar detalle'; this.loading = false; }
        });
    }

    abrirAltaViajeExpreso() {
        const ref = this.dialog.open(AltaViajeExpresoComponent, {
            width: '600px', data: { omnibusId: this.busId }
        });
        ref.afterClosed().subscribe(res => {
            if (res === true || res === 'viajeRegistrado') {
                this.loadBus();
            }
        });
    }

    abrirAsignarMantenimiento() {
        const ref = this.dialog.open(AsignarMantenimientoComponent, {
            width: '600px', data: { omnibusId: this.busId }
        });
        ref.afterClosed().subscribe(res => {
            if (res === 'mantenimientoCreado') {
                this.loadBus();
            }
        });
    }

    cerrar() {
        this.dialogRef.close();
    }
} 