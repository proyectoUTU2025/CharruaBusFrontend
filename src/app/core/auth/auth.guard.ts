import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginService } from '../../services/login.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private loginService: LoginService,
    private router: Router
  ) { }

  canActivate(): boolean {
    return true; // Permite siempre el acceso (solo para desarrollo/test)
    // if (this.loginService.estaLogueado()) {
    //   return true;
    // }
    // this.router.navigate(['/login']);
    // return false;
  }
}