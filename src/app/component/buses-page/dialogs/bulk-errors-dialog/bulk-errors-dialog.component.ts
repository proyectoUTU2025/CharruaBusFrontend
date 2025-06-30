import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { BulkLineResult } from '../../../../models/bulk/bulk-line-result.dto';

@Component({
  standalone: true,
  selector: 'app-buses-bulk-errors-dialog',
  templateUrl: './bulk-errors-dialog.component.html',
  styleUrls: ['./bulk-errors-dialog.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ]
})
export class BulkErrorsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<BulkErrorsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public errors: BulkLineResult[]
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  downloadCsv(): void {
    const header = 'fila,mensaje\n';
    const content = this.errors.map(e => `${e.fila},"${e.mensaje}"`).join('\n');
    const csv = header + content;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'errores_bulk.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
