import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { PasajeService } from '../../../services/pasaje.service';
import { PasajeDto } from '../../../models/pasajes/pasaje.dto';
import { Observable } from 'rxjs';

@Component({
    standalone: true,
    imports: [CommonModule, MatDialogModule],
    selector: 'app-detalle-pasaje-dialog',
    templateUrl: './detalle-pasaje-dialog.component.html',
    styleUrls: ['./detalle-pasaje-dialog.component.scss']
})
export class DetallePasajeDialogComponent implements OnInit {
    pasaje$!: Observable<PasajeDto>;

    constructor(
        private dialogRef: MatDialogRef<DetallePasajeDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { pasajeId: number },
        private pasajeService: PasajeService
    ) { }

    ngOnInit() {
        this.pasaje$ = this.pasajeService.getDetallePasaje(this.data.pasajeId);
    }

    close() {
        this.dialogRef.close();
    }

    descargarPdf() {
        this.pasajeService.descargarPdf(this.data.pasajeId)
            .subscribe(blob => {
                const url = window.URL.createObjectURL(blob);
                window.open(url);
            });
    }
}
