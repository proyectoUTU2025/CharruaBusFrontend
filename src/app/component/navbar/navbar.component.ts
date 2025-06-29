import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    MatChipsModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  constructor(
    private router: Router,
    public authService: AuthService,
  ) {}

  navigateIfNeeded(path: string) {
    if (this.router.url !== path) {
      this.router.navigateByUrl(path);
    }
  }

  onLogoClick(): void {
    if (this.router.url === '/' || this.router.url === '') {
      window.location.reload();
    } else {
      this.router.navigate(['']);
    }
  }

  onLogout(): void {
    this.authService.logout({ 
      message: 'Has cerrado sesión correctamente.', 
      type: 'success' 
    });
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  get userRole(): string | null {
    return this.authService.rol;
  }

  getUserRoleChipColor(): 'primary' | 'accent' | 'warn' {
    switch (this.userRole) {
      case 'ADMIN':
        return 'primary';
      case 'VENDEDOR':
        return 'accent';
      case 'CLIENTE':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getUserRoleChipText(): string {
    switch (this.userRole) {
      case 'ADMIN':
        return 'ADMIN';
      case 'VENDEDOR':
        return 'VENDEDOR';
      case 'CLIENTE':
        return 'CLIENTE';
      default:
        return '';
    }
  }

  getRoleChipClass(rol: string): string {
    switch (rol) {
      case 'ADMIN':
        return 'admin';
      case 'VENDEDOR':
        return 'vendedor';
      case 'CLIENTE':
        return 'cliente';
      default:
        return '';
    }
  }
}
