import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Injectable({ providedIn: 'root' })
export class LoggedInGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  canActivate(): boolean {
    // Si el usuario está logueado, redirigir a /home
    if (this.auth.isLoggedIn) {
      this.router.navigate(['/home']);
      return false;
    }
    // Si no está logueado, permitir acceso (al landing page)
    return true;
  }
} 