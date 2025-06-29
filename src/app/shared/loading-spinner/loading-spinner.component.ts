import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatProgressBarModule],
  template: `
    <div class="loading-container" [class.overlay]="overlay">
      <div class="loading-content">
        <mat-spinner *ngIf="type === 'spinner'" [diameter]="diameter" [color]="color"></mat-spinner>
        <mat-progress-bar *ngIf="type === 'bar'" [mode]="barMode" [value]="progress" [color]="color"></mat-progress-bar>
        <p *ngIf="message" class="loading-message">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
      padding: 20px;
    }

    .loading-container.overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 9999;
      min-height: 100vh;
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .loading-message {
      margin: 0;
      color: var(--text-secondary);
      font-size: 14px;
      text-align: center;
    }

    mat-progress-bar {
      width: 200px;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() type: 'spinner' | 'bar' = 'spinner';
  @Input() diameter: number = 50;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() message: string = '';
  @Input() overlay: boolean = false;
  @Input() barMode: 'determinate' | 'indeterminate' = 'indeterminate';
  @Input() progress: number = 0;
} 