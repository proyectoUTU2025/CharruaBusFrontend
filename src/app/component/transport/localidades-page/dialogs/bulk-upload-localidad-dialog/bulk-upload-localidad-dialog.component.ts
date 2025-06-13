import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-bulk-upload-localidad-dialog',
  templateUrl: './bulk-upload-localidad-dialog.component.html',
  styleUrls: ['./bulk-upload-localidad-dialog.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class BulkUploadLocalidadDialogComponent {
  file: File | null = null;

  constructor(private dialogRef: MatDialogRef<BulkUploadLocalidadDialogComponent>) {}

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length) this.file = files[0];
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.file = input.files[0];
  }

  downloadTemplate() {
    const header = 'departamento,nombre,codigo\n';
    const blob = new Blob([header], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_localidades.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  process() {
    this.dialogRef.close(this.file);
  }

  cancel() {
    this.dialogRef.close();
  }
}
