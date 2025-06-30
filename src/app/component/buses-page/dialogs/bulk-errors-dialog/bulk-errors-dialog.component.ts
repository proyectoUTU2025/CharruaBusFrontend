import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { BulkLineResult } from '../../../../models/bulk/bulk-line-result.dto';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-buses-bulk-errors-dialog',
  templateUrl: './bulk-errors-dialog.component.html',
  styleUrls: ['./bulk-errors-dialog.component.scss'],
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule]
})
export class BulkErrorsDialogComponent {
  results: BulkLineResult[];
  successCount: number;
  errorCount: number;
  errors: BulkLineResult[];
  isHeaderError = false;

  constructor(
    public dialogRef: MatDialogRef<BulkErrorsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BulkLineResult[]
  ) {
    this.results = data;
    this.errors = this.results.filter(r => !r.creado);
    this.errorCount = this.errors.length;
    this.successCount = this.results.length - this.errorCount;

    if (this.errorCount === 1 && this.errors[0].fila === 0) {
      this.isHeaderError = true;
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  downloadCsv(): void {
    const header = 'fila,creado,mensaje\n';
    const content = this.results.map(e => {
      const message = e.mensaje || 'Creado exitosamente';
      return `${e.fila},${e.creado},"${message}"`;
    }).join('\n');

    const csv = header + content;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resultado_carga_masiva_omnibus.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
