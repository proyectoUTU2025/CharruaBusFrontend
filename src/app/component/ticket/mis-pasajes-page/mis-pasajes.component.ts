import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { MaterialModule } from '../../../shared/material.module';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PasajeService } from '../../../services/pasaje.service';
import { PasajeDto } from '../../../models/pasaje.dto';
import { FiltroBusquedaPasajeDto } from '../../../models/filtro-busqueda-pasaje.dto';

@Component({
    selector: 'app-mis-pasajes',
    standalone: true,
    imports: [
        SharedModule,
        MaterialModule,
        RouterModule
    ],
    templateUrl: './mis-pasajes.component.html',
    styleUrls: ['./mis-pasajes.component.scss']
})
export class MisPasajesComponent implements OnInit {
    filterForm!: FormGroup;
    pasajes: PasajeDto[] = [];
    page = 0;
    size = 10;
    totalElements = 0;
    displayedColumns = ['fechaCompra', 'estado', 'asientoNumero', 'origenNombre', 'destinoNombre', 'precio', 'detalle'];

    constructor(
        private fb: FormBuilder,
        private pasajeService: PasajeService
    ) { }

    ngOnInit(): void {
        this.filterForm = this.fb.group({
            fechaDesde: [null],
            fechaHasta: [null],
            origenId: [null],
            destinoId: [null],
            estados: [[]]
        });
        this.loadPasajes();
    }

    loadPasajes(): void {
        const filtro: FiltroBusquedaPasajeDto = {
            fechaDesde: this.filterForm.value.fechaDesde,
            fechaHasta: this.filterForm.value.fechaHasta,
            origenId: this.filterForm.value.origenId,
            destinoId: this.filterForm.value.destinoId,
            estados: this.filterForm.value.estados
        };
        const clienteId = Number(localStorage.getItem('clienteId'));
        this.pasajeService.getHistorialPasajes(clienteId, filtro, this.page, this.size)
            .then(pageData => {
                this.pasajes = pageData.content;
                this.totalElements = pageData.totalElements;
            });
    }

    applyFilter(): void {
        this.page = 0;
        this.loadPasajes();
    }

    onPageChange(event: any): void {
        this.page = event.pageIndex;
        this.size = event.pageSize;
        this.loadPasajes();
    }
}
