import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../../services/user.service';
import { BulkLineResult } from '../../../../models/bulk/bulk-line-result.dto';
import { BulkResponseDto } from '../../../../models/bulk/bulk-response.dto';
import { BulkErrorsDialogComponent } from '../bulk-errors-dialog/bulk-errors-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  standalone: true,
  selector: 'app-bulk-upload-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './bulk-upload-dialog.component.html',
  styleUrls: ['./bulk-upload-dialog.component.scss']
})
export class BulkUploadDialogComponent {
  file: File | null = null;
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<BulkUploadDialogComponent>,
    private userService: UserService,
    private dialog: MatDialog,
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
    const header = 'email,password,nombre,apellido,fechaNacimiento,documento,tipoDocumento,rol\n';
    const blob = new Blob([header], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_usuarios.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  process() {
    if (!this.file) return;
    
    this.loading = true; // Inicia la carga

    this.userService.bulkUpload(this.file)
      .then((resp: BulkResponseDto) => {
        this.loading = false;

        const schemaError = resp.results.find(r => r.fila === 0 && !r.creado);

        if (schemaError) {
          this.snackBar.open(schemaError.mensaje, 'Cerrar', {
            duration: 10000,
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
          this.dialogRef.close();
        } else {
          this.dialogRef.close(true);
          this.dialog.open(BulkErrorsDialogComponent, {
            width: '500px',
            data: resp.results,
            disableClose: true,
          });
        }
      })
      .catch((error: HttpErrorResponse) => {
        this.loading = false;
        const errorMessage = error.error?.message || 'Ocurrió un error inesperado.';
        
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 7000,
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        this.dialogRef.close();
      });
  }

  cancel() {
    this.dialogRef.close();
  }
}
