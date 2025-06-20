import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { EstadisticaPasaje } from '../../../../models/estadisticas/transporte/estadistica-pasaje';
import { TipoDepartamento } from '../../../../models/estadisticas/transporte/tipo-departamento';
import { EstadisticaTransporteService } from '../../../../services/estadistica-transporte.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-estadisticas-pasajes',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatCardModule
    ],
    templateUrl: './estadisticas-pasajes.component.html',
    styleUrls: ['./estadisticas-pasajes.component.scss']
})
export class EstadisticasPasajesComponent implements OnInit {
    fechaInicio = new FormControl<string | null>(null);
    fechaFin = new FormControl<string | null>(null);
    origen = new FormControl<TipoDepartamento | null>(null);
    destino = new FormControl<TipoDepartamento | null>(null);
    departamentos = Object.values(TipoDepartamento);
    resultado: EstadisticaPasaje | null = null;
    constructor(private svc: EstadisticaTransporteService) { }
    ngOnInit() { }
    load() {
        this.svc.getEstadisticaPasajes(
            this.fechaInicio.value || undefined,
            this.fechaFin.value || undefined,
            this.origen.value || undefined,
            this.destino.value || undefined
        ).subscribe(r => this.resultado = r);
    }
    exportCsv() {
        this.svc.exportEstadisticaPasajesCsv({
            fechaInicio: this.fechaInicio.value || undefined,
            fechaFin: this.fechaFin.value || undefined,
            origen: this.origen.value || undefined,
            destino: this.destino.value || undefined
        }).subscribe(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'estadisticas_pasajes.csv';
            a.click();
            URL.revokeObjectURL(url);
        });
    }
}
