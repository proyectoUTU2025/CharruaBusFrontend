import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { ComponentType } from '@angular/cdk/portal';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog/confirm-dialog.component';

export interface SnackBarConfig {
  duration?: number;
  horizontalPosition?: 'start' | 'center' | 'end' | 'left' | 'right';
  verticalPosition?: 'top' | 'bottom';
  panelClass?: string | string[];
}

export interface DialogConfig {
  width?: string;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
  disableClose?: boolean;
  autoFocus?: boolean;
  panelClass?: string | string[];
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class MaterialUtilsService {

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private bottomSheet: MatBottomSheet
  ) { }

  showSuccess(message: string, config?: SnackBarConfig): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: config?.duration || 3000,
      horizontalPosition: config?.horizontalPosition || 'center',
      verticalPosition: config?.verticalPosition || 'top',
      panelClass: ['success-snackbar', ...(config?.panelClass ? (Array.isArray(config.panelClass) ? config.panelClass : [config.panelClass]) : [])]
    });
  }

  showError(message: string, config?: SnackBarConfig): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: config?.duration || 5000,
      horizontalPosition: config?.horizontalPosition || 'center',
      verticalPosition: config?.verticalPosition || 'top',
      panelClass: ['error-snackbar', ...(config?.panelClass ? (Array.isArray(config.panelClass) ? config.panelClass : [config.panelClass]) : [])]
    });
  }

  showWarning(message: string, config?: SnackBarConfig): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: config?.duration || 4000,
      horizontalPosition: config?.horizontalPosition || 'center',
      verticalPosition: config?.verticalPosition || 'top',
      panelClass: ['warning-snackbar', ...(config?.panelClass ? (Array.isArray(config.panelClass) ? config.panelClass : [config.panelClass]) : [])]
    });
  }

  showInfo(message: string, config?: SnackBarConfig): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: config?.duration || 3000,
      horizontalPosition: config?.horizontalPosition || 'center',
      verticalPosition: config?.verticalPosition || 'top',
      panelClass: ['info-snackbar', ...(config?.panelClass ? (Array.isArray(config.panelClass) ? config.panelClass : [config.panelClass]) : [])]
    });
  }

  openDialog<T>(component: ComponentType<T>, config?: DialogConfig): MatDialogRef<T> {
    return this.dialog.open(component, {
      width: config?.width || '500px',
      height: config?.height,
      maxWidth: config?.maxWidth || '90vw',
      maxHeight: config?.maxHeight || '90vh',
      disableClose: config?.disableClose || false,
      autoFocus: config?.autoFocus !== false,
      panelClass: config?.panelClass,
      data: config?.data
    });
  }

  openBottomSheet<T>(component: ComponentType<T>, config?: DialogConfig): MatBottomSheetRef<T> {
    return this.bottomSheet.open(component, {
      panelClass: config?.panelClass,
      data: config?.data
    });
  }

  closeAllDialogs(): void {
    this.dialog.closeAll();
  }

  closeAllBottomSheets(): void {
    this.bottomSheet.dismiss();
  }

  showConfirmation(message: string, title: string = 'Confirmar', type: 'info' | 'warning' | 'error' | 'success' = 'info'): Promise<boolean> {
    const dialogData: ConfirmDialogData = {
      title,
      message,
      type
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true,
      data: dialogData
    });

    return dialogRef.afterClosed().toPromise();
  }

  showLoading(message: string = 'Cargando...'): void {
    this.snackBar.open(message, '', {
      duration: 0,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['loading-snackbar']
    });
  }

  hideLoading(): void {
    this.snackBar.dismiss();
  }
} 