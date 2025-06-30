import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LocalidadService } from '../../../../services/localidades.service';
import { BulkResponseDto } from '../../../../models/bulk/bulk-response.dto';
import { BulkLineResult } from '../../../../models/bulk/bulk-line-result.dto';

@Component({
  standalone: true,
  selector: 'app-bulk-upload-localidad-dialog',
  templateUrl: './bulk-upload-localidad-dialog.component.html',
  styleUrls: ['./bulk-upload-localidad-dialog.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ]
})
export class BulkUploadLocalidadDialogComponent {
  file: File | null = null;
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<BulkUploadLocalidadDialogComponent>,
    private localidadService: LocalidadService,
    private snackBar: MatSnackBar
  ) {}

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files.length) {
      this.file = event.dataTransfer.files[0];
    }
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.file = input.files[0];
    }
  }

  downloadTemplate() {
    const header = 'nombre,departamento\n';
    const content = 'Ejemplo Localidad,MONTEVIDEO\n';
    const blob = new Blob([header, content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_localidades.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  process() {
    if (!this.file) return;

    this.loading = true;

    this.localidadService.bulkUpload(this.file).subscribe({
      next: (resp: BulkResponseDto) => {
        this.loading = false;
        const errors = resp.results.filter((r: BulkLineResult) => !r.creado);
        if (errors.length > 0) {
          this.dialogRef.close({ errors });
        } else {
          this.snackBar.open('Archivo procesado con éxito', 'OK', { duration: 3000 });
          this.dialogRef.close({ success: true });
        }
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Error al procesar el archivo', 'Cerrar', { duration: 4000 });
      }
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
