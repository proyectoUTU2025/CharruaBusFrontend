import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BusService } from '../../../../services/bus.service';
import { BulkLineResult } from '../../../../models/bulk/bulk-line-result.dto';
import { BulkResponseDto } from '../../../../models/bulk/bulk-response.dto';
import { BulkErrorsDialogComponent } from '../bulk-errors-dialog/bulk-errors-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import { MaterialUtilsService } from '../../../../shared/material-utils.service';

@Component({
  standalone: true,
  selector: 'app-bulk-upload-bus-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './bulk-upload-bus-dialog.component.html',
  styleUrls: ['./bulk-upload-bus-dialog.component.scss']
})
export class BulkUploadBusDialogComponent {
  file: File | null = null;
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<BulkUploadBusDialogComponent>,
    private busService: BusService,
    private dialog: MatDialog,
    private materialUtils: MaterialUtilsService
  ) {}

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
    const header = 'matricula,cantidadAsientos,localidadId\n';
    const blob = new Blob([header], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_omnibus.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  process() {
    if (!this.file) return;
    
    this.loading = true;

    this.busService.bulkUpload(this.file)
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