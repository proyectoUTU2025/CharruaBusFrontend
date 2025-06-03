import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-alta-viaje-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './alta-viaje-confirm-dialog.component.html',
  styleUrls: ['./alta-viaje-confirm-dialog.component.scss']
})
export class AltaViajeConfirmDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<AltaViajeConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mensaje: string }
  ) {}

  confirmar(): void {
    this.dialogRef.close(true);
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
