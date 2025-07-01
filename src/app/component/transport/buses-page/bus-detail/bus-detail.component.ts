import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedModule } from '../../../../shared/shared.module';
import { MaterialModule } from '../../../../shared/material.module';
import { NgIf } from '@angular/common';
import { BusService } from '../../../../services/bus.service';
import { BusDto } from '../../../../models/buses';

@Component({
    standalone: true,
    selector: 'app-bus-detail',
    imports: [
        SharedModule,
        MaterialModule,
        NgIf,
        MatProgressSpinnerModule,
    ],
    templateUrl: './bus-detail.component.html',
    styleUrls: ['./bus-detail.component.scss']
})
export class BusDetailComponent implements OnInit {
    @Input() busId?: number;
    bus?: BusDto;
    loading = true;
    error = '';

    constructor(
        private busService: BusService,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        if (this.busId) {
            this.loadBus();
        } else {
            const paramId = this.route.snapshot.paramMap.get('id');
            if (paramId) {
                this.busId = +paramId;
                this.loadBus();
            } else {
                this.error = 'No se encontró el ID del ómnibus en la URL.';
                this.loading = false;
            }
        }
    }

    private loadBus() {
        if (!this.busId) {
            this.error = 'No se especificó ómnibus.';
            this.loading = false;
            return;
        }
        this.loading = true;
        this.error = '';
        this.busService.getById(this.busId).subscribe({
            next: b => { this.bus = b; this.loading = false; },
            error: () => { this.error = 'No se pudo cargar detalle'; this.loading = false; }
        });
    }
}
