import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

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
  template: `
    <h2 mat-dialog-title>Resumen de Compra</h2>
    <mat-dialog-content>
      <mat-list>
        <mat-list-item *ngFor="let s of data.seats">
          Asiento {{ s }}
        </mat-list-item>
      </mat-list>
      <p><strong>Total:</strong> {{ data.total }} UYU</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel.emit()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="confirm.emit()">Confirmar</button>
    </mat-dialog-actions>
  `
})
export class PurchaseSummaryDialogComponent {
  @Input() data!: SummaryDialogData;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
