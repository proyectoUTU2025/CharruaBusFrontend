import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PasajeService } from '../../services/pasaje.service';
import { PasajeDto } from '../../models/pasajes/pasaje-dto.model';
import { Observable } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-pasajes-por-viaje',
    imports: [
        CommonModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatSnackBarModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './pasajes-por-viaje.component.html',
    styleUrls: ['./pasajes-por-viaje.component.scss']
})
export class PasajesPorViajeComponent implements OnInit {
    /** Identificador del viaje cuyos pasajes se listan */
    @Input() viajeId!: number;

    pasajes: PasajeDto[] = [];
    isLoading = false;
    error: string | null = null;

    displayedColumns: string[] = ['id', 'clienteEmail', 'asiento', 'fechaCompra', 'estado', 'acciones'];

    constructor(
        private pasajeService: PasajeService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadPasajes();
    }

    loadPasajes(page = 0, size = 20): void {
        this.isLoading = true;
        this.error = null;
        // Asume que getHistorialPasajes puede usarse aquí pasando viajeId
        this.pasajeService.getHistorialPasajes(this.viajeId, {}, page, size)
            .subscribe({
                next: resp => {
                    this.pasajes = resp.content;
                    this.isLoading = false;
                },
                error: () => {
                    this.error = 'Error al cargar pasajes';
                    this.isLoading = false;
                }
            });
    }

    refund(pasajeId: number): void {
        if (!confirm('¿Confirmar devolución del pasaje?')) return;
        this.pasajeService.reembolsarPasaje(pasajeId)
            .subscribe({
                next: () => {
                    this.snackBar.open('Pasaje devuelto correctamente', 'Cerrar', { duration: 3000 });
                    this.loadPasajes();
                },
                error: err => {
                    const msg = err.error?.message || 'Error al devolver pasaje';
                    this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
                }
            });
    }
}




