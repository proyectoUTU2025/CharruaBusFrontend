import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { MaterialUtilsService } from '../../shared/material-utils.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  template: `
    <div class="not-found-container">
      <div class="not-found-card">
        <div class="header-bar"></div>
        <div class="logo-container">
          <img src="assets/charruabusIcon.png" alt="Charrua Bus" class="logo">
        </div>
        
        <h1 class="title">Página no encontrada</h1>
        
        <p class="subtitle" *ngIf="isLoggedIn; else publicMessage">
          La página que buscas no existe o no tienes permisos para acceder a ella.
        </p>
        
        <ng-template #publicMessage>
          <p class="subtitle">
            La página que buscas no existe.
          </p>
        </ng-template>

        <div class="actions-form" *ngIf="isLoggedIn; else publicActions">
          <button mat-flat-button color="primary" class="action-button" (click)="goToHome()">
            <mat-icon>home</mat-icon>
            <span>Ir al Inicio</span>
          </button>
          
          <button mat-stroked-button class="secondary-button" (click)="goBack()" *ngIf="canGoBack">
            <mat-icon>arrow_back</mat-icon>
            <span>Volver Atrás</span>
          </button>
        </div>

        <ng-template #publicActions>
          <div class="actions-form">
            <button mat-flat-button color="primary" class="action-button" (click)="goToLanding()">
              <mat-icon>home</mat-icon>
              <span>Ir al Inicio</span>
            </button>
            
            <button mat-stroked-button class="secondary-button" (click)="goToLogin()">
              <mat-icon>login</mat-icon>
              <span>Iniciar Sesión</span>
            </button>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    $primary-color: #1976d2;
    $background: #f5f7fa;

    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 4rem);
      width: 100vw;
      background: $background;
      padding: 0;
      box-sizing: border-box;
    }

    .not-found-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 32px 16px;
      background: #f5f7fa;
    }

    .not-found-card {
      width: 100%;
      max-width: 440px;
      min-width: 320px;
      margin: 32px 0;
      background-color: #fff;
      border-radius: 16px;
      box-shadow: 0 6px 32px rgba(25, 118, 210, 0.10);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      padding-bottom: 8px;
    }

    .header-bar {
      height: 8px;
      background-color: $primary-color;
    }

    .logo-container {
      display: flex;
      justify-content: center;
      margin: 32px 0 20px;
      user-select: none;
      caret-color: transparent;
      cursor: default;
      pointer-events: none;

      .logo {
        width: 90px;
        height: 90px;
      }
    }

    .title {
      font-size: 28px;
      font-weight: 700;
      color: #1976d2;
      text-align: center;
      margin-bottom: 8px;
      margin-top: 8px;
      user-select: none;
      caret-color: transparent;
      cursor: default;
    }

    .subtitle {
      font-size: 15px;
      color: #666;
      text-align: center;
      margin-bottom: 28px;
      user-select: none;
      caret-color: transparent;
      cursor: default;
    }

    .actions-form {
      padding: 0 32px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .action-button {
      width: 100%;
      padding: 14px 0;
      background-color: #1976d2 !important;
      color: white !important;
      border: none;
      border-radius: 10px;
      font-size: 18px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(25, 118, 210, 0.10);
      letter-spacing: 0.5px;
      transition: background 0.2s, box-shadow 0.2s;
      text-transform: none;
      gap: 8px;

      mat-icon {
        font-size: 22px;
        height: 22px;
        width: 22px;
      }

      span {
        font-size: 18px;
        font-weight: 500;
        letter-spacing: 0.5px;
      }

      &:hover {
        background-color: #1251a3 !important;
        box-shadow: 0 4px 16px rgba(25, 118, 210, 0.18);
      }
      
      &:active {
        background-color: #0d3570 !important;
      }
    }

    .secondary-button {
      width: 100%;
      padding: 14px 0;
      border: 2px solid #1976d2;
      color: #1976d2;
      border-radius: 10px;
      font-size: 18px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      letter-spacing: 0.5px;
      transition: all 0.2s;
      text-transform: none;
      gap: 8px;
      background: white;

      mat-icon {
        font-size: 22px;
        height: 22px;
        width: 22px;
      }

      span {
        font-size: 18px;
        font-weight: 500;
        letter-spacing: 0.5px;
      }

      &:hover {
        background-color: #1976d2;
        color: white;
      }
    }

    @media (max-width: 600px) {
      .not-found-card {
        max-width: 98vw;
        min-width: unset;
        margin: 8px 0;
        border-radius: 10px;
      }
      
      .actions-form {
        padding: 0 8px 16px;
      }
      
      .action-button, .secondary-button {
        font-size: 17px;
        padding: 12px 0;
      }
      
      .action-button span, .secondary-button span {
        font-size: 17px;
      }
    }
  `]
})
export class NotFoundComponent implements OnInit {
  isLoggedIn = false;
  canGoBack = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private materialUtils: MaterialUtilsService
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.estaLogueado();
    this.canGoBack = window.history.length > 1;
    
    if (this.isLoggedIn) {
      this.showNotFoundMessage();
    }
  }

  private showNotFoundMessage() {
    this.materialUtils.showError(
      'La página solicitada no fue encontrada.'
    );
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToLanding() {
    this.router.navigate(['/']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goBack() {
    window.history.back();
  }
} 