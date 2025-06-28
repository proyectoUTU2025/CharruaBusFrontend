import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedModule } from '../../../../shared/shared.module';
import { MaterialModule } from '../../../../shared/material.module';
import { NgIf } from '@angular/common';
import { BusService } from '../../../../services/bus.service';
import { BusDto } from '../../../../models/buses';
import { OmnibusHistoryComponent } from './omnibus-history/omnibus-history.component';
import { AsignarMantenimientoComponent } from '../../mantenimientos-page/asignar-mantenimiento/asignar-mantenimiento.component';
import { AltaViajeExpresoComponent } from '../../viajes-page/alta-viaje-expreso/alta-viaje-expreso.component';

@Component({
    standalone: true,
    selector: 'app-bus-detail',
    imports: [
        SharedModule,
        MaterialModule,
        NgIf,
        MatProgressSpinnerModule,
        OmnibusHistoryComponent,
        AsignarMantenimientoComponent,
        AltaViajeExpresoComponent
    ],
    templateUrl: './bus-detail.component.html',
    styleUrls: ['./bus-detail.component.scss']
})
export class BusDetailComponent implements OnInit {
    busId!: number;
    bus?: BusDto;
    loading = true;
    error = '';
    @ViewChild(OmnibusHistoryComponent) historyComponent!: OmnibusHistoryComponent;

    constructor(
        private route: ActivatedRoute,
        private busService: BusService,
        private dialog: MatDialog
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.busId = +id;
                this.loadBus();
            }
        });
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
                setTimeout(() => this.historyComponent.loadHistory(), 0);
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
                setTimeout(() => this.historyComponent.loadHistory(), 0);
            }
        });
    }
}
