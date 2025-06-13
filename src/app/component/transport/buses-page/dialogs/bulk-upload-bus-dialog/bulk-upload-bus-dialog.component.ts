import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-bulk-upload-bus-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './bulk-upload-bus-dialog.component.html',
  styleUrls: ['./bulk-upload-bus-dialog.component.scss']
})
export class BulkUploadBusDialogComponent {
  file: File | null = null;

  constructor(private dialogRef: MatDialogRef<BulkUploadBusDialogComponent>) {}

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
    const header = 'id,matricula,localidad,cantidadAsientos,estado\n';
    const blob = new Blob([header], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_omnibus.csv';
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