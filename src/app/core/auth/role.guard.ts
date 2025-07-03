import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Primero verificar si está logueado
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/login']);
      return false;
    }

    // Obtener los roles permitidos de los datos de la ruta
    const allowedRoles = route.data['roles'] as string[];
    
    // Si no hay roles específicos definidos, permitir acceso a cualquier usuario logueado
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    // Verificar si el rol del usuario está en los roles permitidos
    const userRole = this.authService.rol;
    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    // Si no tiene permisos, mostrar página 404
    this.router.navigate(['/not-found']);
    return false;
  }
} 