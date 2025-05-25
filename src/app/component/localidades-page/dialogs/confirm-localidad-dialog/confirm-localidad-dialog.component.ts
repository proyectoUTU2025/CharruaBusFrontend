import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-localidad-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule,MatDialogModule],
  templateUrl: './confirm-localidad-dialog.component.html',
  styleUrls: ['./confirm-localidad-dialog.component.scss']
})
export class ConfirmLocalidadDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmLocalidadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }
  ) {}

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
