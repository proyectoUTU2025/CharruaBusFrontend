import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  showCancel?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatDividerModule],
  template: `
    <div class="confirm-dialog-wrapper">
      <div class="header" [ngClass]="data.type || 'info'">
        <mat-icon>{{ getIcon() }}</mat-icon>
        <h2 mat-dialog-title>{{ data.title }}</h2>
      </div>
      <mat-divider></mat-divider>
      <div mat-dialog-content>
        <p>{{ data.message }}</p>
      </div>
      <mat-divider></mat-divider>
      <div mat-dialog-actions>
        <button mat-stroked-button class="cancel-btn" (click)="onCancel()">{{ data.cancelText || 'Cancelar' }}</button>
        <button mat-flat-button class="confirm-btn" [class.warn]="data.type === 'error' || data.type === 'warning'" (click)="onConfirm()">{{ data.confirmText || 'Confirmar' }}</button>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .mat-mdc-dialog-actions {
      justify-content: space-between !important;
    }

    .confirm-dialog {
      min-width: 400px;
      max-width: 500px;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 500;
      padding: 24px 24px 16px;
    }

    .header.info { color: var(--app-primary); }
    .header.success { color: var(--app-success); }
    .header.warning { color: var(--app-warn); }
    .header.error { color: var(--app-warn); }
    
    h2 {
      margin: 0;
      font-size: 1.25rem;
    }
    
    mat-dialog-content {
      padding: 20px 24px;
      color: #555;
    }

    mat-dialog-content p {
      margin: 0;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      gap: 8px;
    }
    
    .cancel-btn {
      border: 1px solid var(--primary-color, #1976d2);
      color: var(--primary-color, #1976d2);
      background: white;
      text-transform: none;
      font-weight: 500;
      border-radius: 8px;
      padding: 8px 20px;
    }

    .confirm-btn {
      background-color: var(--primary-color, #1976d2);
      color: white;
      text-transform: none;
      font-weight: 500;
      border-radius: 8px;
      padding: 8px 20px;
    }

    .confirm-btn.warn {
      background-color: var(--app-warn, #d32f2f);
    }

    @media (max-width: 600px) {
      .confirm-dialog {
        min-width: 300px;
        margin: 16px;
      }
      
      .header {
        padding: 12px 16px 6px;
      }
      
      mat-dialog-actions {
        padding: 12px 16px;
      }
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  getIcon(): string {
    switch (this.data.type) {
      case 'warning':
        return 'gpp_bad';
      case 'error':
        return 'error';
      case 'success':
        return 'check_circle';
      default:
        return 'info_outline';
    }
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
} 