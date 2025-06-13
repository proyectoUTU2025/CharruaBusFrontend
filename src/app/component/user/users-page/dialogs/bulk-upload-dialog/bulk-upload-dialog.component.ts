import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../../../services/user.service';
import { BulkLineResult } from '../../../../../models/bulk/bulk-line-result.dto';
import { BulkResponseDto } from '../../../../../models/bulk/bulk-response.dto';
import { BulkErrorsDialogComponent } from '../bulk-errors-dialog/bulk-errors-dialog.component';

@Component({
  standalone: true,
  selector: 'app-bulk-upload-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './bulk-upload-dialog.component.html',
  styleUrls: ['./bulk-upload-dialog.component.scss']
})
export class BulkUploadDialogComponent {
  file: File | null = null;

  constructor(
    private dialogRef: MatDialogRef<BulkUploadDialogComponent>,
    private userService: UserService,
    private dialog: MatDialog
  ) { }

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
    const header = 'id,nombre,correo,documento,rol\n';
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
    this.userService.bulkUpload(this.file)
      .then((resp: BulkResponseDto) => {
        const errores = resp.results.filter((r: BulkLineResult) => !r.creado);
        if (errores.length > 0) {
          this.dialog.open(BulkErrorsDialogComponent, {
            width: '600px',
            data: errores
          });
        } else {
          this.dialogRef.close(true);
        }
      })
      .catch(console.error);
  }

  cancel() {
    this.dialogRef.close();
  }
}
