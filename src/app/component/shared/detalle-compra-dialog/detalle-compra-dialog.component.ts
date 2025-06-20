import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { CompraService } from '../../../services/compra.service';
import { DetalleCompraDto } from '../../../models/compra/compra.dto.model';
import { Observable } from 'rxjs';

@Component({
    standalone: true,
    imports: [CommonModule, MatDialogModule],
    selector: 'app-detalle-compra-dialog',
    templateUrl: './detalle-compra-dialog.component.html',
    styleUrls: ['./detalle-compra-dialog.component.scss']
})
export class DetalleCompraDialogComponent implements OnInit {
    detalle$!: Observable<DetalleCompraDto>;

    constructor(
        private dialogRef: MatDialogRef<DetalleCompraDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { compraId: number },
        private compraService: CompraService
    ) { }

    ngOnInit() {
        this.detalle$ = this.compraService.getDetalle(this.data.compraId);
    }

    close() {
        this.dialogRef.close();
    }
}
