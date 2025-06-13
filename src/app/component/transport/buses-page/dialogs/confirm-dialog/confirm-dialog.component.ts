import { ConfirmDialogComponent } from './../../../users-page/dialogs/confirm-dialog/confirm-dialog.component';
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmBusDialogComponent {
  title: string;
  message: string;
}

@Component({
  standalone: true,
  selector: 'app-confirm-bus-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmBusDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmBusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmBusDialogComponent 
  ) {}

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}