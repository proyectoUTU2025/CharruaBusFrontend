import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';

export interface SummaryDialogData {
  seats: number[];
  total: number;
}

@Component({
  selector: 'app-purchase-summary-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatListModule,
    MatButtonModule
  ],
  templateUrl: './purchase-summary-dialog.component.html',
  styleUrls: ['./purchase-summary-dialog.component.scss']
})
export class PurchaseSummaryDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PurchaseSummaryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SummaryDialogData
  ) {}

  confirm() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
