import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
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
import { NotificacionesComponent } from '../shared/notificaciones/notificaciones.component';

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
    MatChipsModule,
    NotificacionesComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  mobileMenuOpen = false;
  estadisticasSubmenuOpen = false;

  constructor(
    private router: Router,
    public authService: AuthService,
  ) {}

  ngOnInit() {
    // Cerrar menú móvil si la pantalla ya es grande al cargar
    this.checkScreenSize();
  }

  ngOnDestroy() {
    document.body.classList.remove('mobile-menu-open');
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const isDesktop = window.matchMedia('(min-width: 59.375em)').matches;
    if (isDesktop && this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  navigateIfNeeded(path: string) {
    if (this.router.url !== path) {
      this.router.navigateByUrl(path);
    }
  }

  onLogoClick(): void {
    if (this.isLoggedIn) {
      // Si el usuario está logueado, ir a /home
      if (this.router.url === '/home') {
        window.location.reload();
      } else {
        this.router.navigate(['/home']);
      }
    } else {
      // Si el usuario NO está logueado, ir a la landing page
      if (this.router.url === '/' || this.router.url === '') {
        window.location.reload();
      } else {
        this.router.navigate(['']);
      }
    }
  }

  onLogout(): void {
    this.closeMobileMenu();
    this.authService.logout({ 
      message: 'Has cerrado sesión correctamente.', 
      type: 'success' 
    });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    this.estadisticasSubmenuOpen = false; 
    
    if (this.mobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    this.estadisticasSubmenuOpen = false;
    document.body.classList.remove('mobile-menu-open');
  }

  toggleEstadisticasSubmenu(): void {
    this.estadisticasSubmenuOpen = !this.estadisticasSubmenuOpen;
  }

  navigateAndClose(path: string): void {
    this.navigateIfNeeded(path);
    this.closeMobileMenu();
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
