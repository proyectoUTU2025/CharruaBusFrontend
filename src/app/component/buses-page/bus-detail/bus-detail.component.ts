import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { BusService } from '../../../services/bus.service';
import { BusDto } from '../../../models/buses/bus-dto.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OmnibusHistoryComponent } from './omnibus-history/omnibus-history.component';
import { MatDialog } from '@angular/material/dialog';
import { AltaViajeExpresoComponent } from '../../viajes-page/alta-viaje-expreso/alta-viaje-expreso.component';
import { AsignarMantenimientoComponent } from '../../mantenimientos-page/asignar-mantenimiento/asignar-mantenimiento.component';

@Component({
    selector: 'app-bus-detail',
    standalone: true,
    imports: [
        CommonModule,
        NgIf,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
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

    @ViewChild(OmnibusHistoryComponent) historyComponent!: OmnibusHistoryComponent;

    constructor(
        private route: ActivatedRoute,
        private busService: BusService,
        private dialog: MatDialog
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const idParam = params.get('id');
            if (idParam !== null) {
                this.busId = +idParam;
                this.loadBus();
            } else {
                console.error('No llegó el parámetro "id" en la URL');
            }
        });
    }

    private loadBus() {
        this.busService.getById(this.busId).subscribe({
            next: (busDto: BusDto) => {
                this.bus = busDto;
            },
            error: err => {
                console.error('Error al cargar detalle de ómnibus:', err);
            }
        });
    }

    abrirAltaViajeExpreso() {
        const dialogRef = this.dialog.open(AltaViajeExpresoComponent, {
            width: '600px',
            data: { omnibusId: this.busId }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === true || result === 'viajeRegistrado') {
                this.loadBus();
                setTimeout(() => {
                    this.historyComponent?.loadHistory(this.historyComponent.pageIndex, this.historyComponent.pageSize);
                }, 0);
            }
        });
    }

    abrirAsignarMantenimiento() {
        const dialogRef = this.dialog.open(AsignarMantenimientoComponent, {
            width: '600px',
            data: { omnibusId: this.busId }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === 'mantenimientoCreado') {
                this.loadBus();
                setTimeout(() => {
                    this.historyComponent?.loadHistory(this.historyComponent.pageIndex, this.historyComponent.pageSize);
                }, 0);
            }
        });
    }
}
