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
import { MaterialUtilsService } from '../../../../shared/material-utils.service';

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
    private snackBar: MatSnackBar,
    private materialUtils: MaterialUtilsService
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
    
    this.loading = true;

    this.userService.bulkUpload(this.file)
      .then((resp: BulkResponseDto) => {
        this.loading = false;
        this.dialogRef.close(true);
        this.dialog.open(BulkErrorsDialogComponent, {
          data: resp.results,
          disableClose: true,
        });
      })
      .catch((error: HttpErrorResponse) => {
        this.loading = false;
        const errorMessage = error.error?.message || 'Ocurrió un error inesperado.';
        
        this.materialUtils.showError(errorMessage, { duration: 4000 });
        this.dialogRef.close();
      });
  }

  cancel() {
    this.dialogRef.close();
  }
}
