import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { PasajeService } from '../../../services/pasaje.service';
import { PasajeDto } from '../../../models/pasajes/pasaje-dto.model';
import { Observable } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-detalle-pasaje-dialog',
    imports: [
        CommonModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        MatIconModule
    ],
    templateUrl: './detalle-pasaje-dialog.component.html',
    styleUrls: ['./detalle-pasaje-dialog.component.scss']
})
export class DetallePasajeDialogComponent {
    pasaje$!: Observable<PasajeDto>;
    isDownloading = false;

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
        this.isDownloading = true;
        this.pasajeService.descargarPdf(this.data.pasajeId)
            .subscribe(blob => {
                const url = window.URL.createObjectURL(blob);
                window.open(url);
            })
            .add(() => this.isDownloading = false);
    }
}
