import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtPayload, jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private _jwt: string | null = null;
  private _decoded: JwtPayload & { name?: string; sub?: string; role?: string } = {};

  constructor(private http: HttpClient, private router: Router) { }


  login(credentials: { email: string; password: string }) {
    return firstValueFrom(
      this.http.post<{ data: { token: string } }>(
        `${environment.apiBaseUrl}/auth/login`,
        credentials
      )
    )
      .then(response => {
        this._jwt = response.data.token;
        this._decoded = jwtDecode(this._jwt);
      })
      .catch(error => {
        console.error('Error durante login:', error);
        throw error;
      });
  }


  validateCode(email: string, code: string) {
    return firstValueFrom(
      this.http.post(
        `${environment.apiBaseUrl}/auth/verify-email`,
        { email, verificationCode: code }
      )
    ).catch(error => {
      console.error('Error durante verificación de email:', error);
      throw error;
    });
  }


  registrarCliente(data: any) {
    return firstValueFrom(
      this.http.post(`${environment.apiBaseUrl}/auth/registrar`, data)
    ).catch(error => {
      console.error('Error durante el registro:', error);
      throw error;
    });
  }

  forgotPassword(email: string): Promise<void> {
    return firstValueFrom(
      this.http.post<{ message: string }>(
        `${environment.apiBaseUrl}/auth/forgot-password`,
        { email }
      )
    ).then(() => { })
      .catch(error => {
        console.error('Error en forgotPassword:', error);
        throw error;
      });
  }


  verifyResetCode(email: string, verificationCode: string): Promise<void> {
    return firstValueFrom(
      this.http.post<ApiResponse<void>>(
        `${environment.apiBaseUrl}/auth/verify-reset-code`,
        { email, verificationCode }
      )
    ).then(() => { });
  }



  resetPassword(
    email: string,
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<void> {
    return firstValueFrom(
      this.http.post<{ message: string }>(
        `${environment.apiBaseUrl}/auth/reset-password`,
        { email, token, newPassword, confirmPassword }
      )
    ).then(() => { })
      .catch(error => {
        console.error('Error en resetPassword:', error);
        throw error;
      });
  }


  get nombre(): string | null {
    return this._decoded.name || null;
  }
  get email(): string | null {
    return this._decoded.sub || null;
  }
  get rol(): string | null {
    return this._decoded.role || null;
  }
  get token(): string | null {
    return this._jwt;
  }
  estaLogueado(): boolean {
    return !!this._jwt;
  }

  logout() {
    this._jwt = null;
    this._decoded = {};
    this.router.navigate(['/login']);
  }
}
