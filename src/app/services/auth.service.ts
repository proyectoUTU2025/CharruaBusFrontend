import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { environment } from '../../environments/environment';
import { ForgotPasswordRequestDto } from '../models/auth/forgot-password-request.dto';
import { VerifyResetCodeRequestDto } from '../models/auth/verify-reset-code-request.dto';
import { ResetPasswordRequestDto } from '../models/auth/reset-password-request.dto';
import { LoginRequestDto } from '../models/auth/login-request.dto';
import { RegisterRequestDto } from '../models/auth/register-request.dto';
import { AuthenticationResponseDto } from '../models/auth/authentication-response.dto';
import { Router } from '@angular/router';

interface DecodedToken extends JwtPayload {
  name?: string;
  sub?: string;
  role?: string;
  id?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = `${environment.apiBaseUrl}/auth`;
  private tokenKey = 'access_token';

  constructor(
    private http: HttpClient,
    private cookies: CookieService,
    private router: Router
  ) { }

  login(credentials: { email: string; password: string }) {
    return firstValueFrom(
      this.http.post<{ data: { token: string } }>(
        `${this.base}/login`,
        credentials
      )
    ).then(response => {
      const token = response.data.token;
      this.cookies.set(this.tokenKey, token, { path: '/' });
    }).catch(error => {
      console.error('Error during login:', error);
      throw error;
    });
  }

  changePassword(payload: { currentPassword: string; newPassword: string }): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(
        `${this.base}/change-password`,
        payload
      )
    );
  }

  validateCode(email: string, code: string) {
    return firstValueFrom(
      this.http.post(`${this.base}/verify-email`, {
        email,
        verificationCode: code
      })
    ).catch(error => {
      console.error('Error during email verification:', error);
      throw error;
    });
  }

  registrarCliente(data: any) {
    return firstValueFrom(
      this.http.post(`${this.base}/registrar`, data)
    ).catch(error => {
      console.error('Error durante el registro:', error);
      throw error;
    });
  }

  logout() {
    firstValueFrom(this.http.post(`${this.base}/logout`, {}))
      .finally(() => {
        this.cookies.delete(this.tokenKey, '/');
        this.router.navigate(['/login']);
      });
  }

  verifyEmail(email: string, verificationCode: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(
        `${this.base}/verify-email`,
        { email, verificationCode } as VerifyResetCodeRequestDto
      )
    );
  }

  requestPasswordReset(email: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(
        `${this.base}/forgot-password`,
        { email } as ForgotPasswordRequestDto
      )
    );
  }

  verifyResetCode(email: string, verificationCode: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(
        `${this.base}/verify-reset-code`,
        { email, verificationCode } as VerifyResetCodeRequestDto
      )
    );
  }

  resetPassword(
    payload: ResetPasswordRequestDto
  ): Promise<void>;
  resetPassword(
    email: string,
    verificationCode: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<void>;
  resetPassword(
    arg1: string | ResetPasswordRequestDto,
    verificationCode?: string,
    newPassword?: string,
    confirmPassword?: string
  ): Promise<void> {
    let body: ResetPasswordRequestDto;
    if (typeof arg1 === 'object') {
      body = arg1;
    } else {
      body = {
        email: arg1,
        verificationCode: verificationCode!,
        newPassword: newPassword!,
        confirmPassword: confirmPassword!
      };
    }
    return firstValueFrom(
      this.http.post<void>(`${this.base}/reset-password`, body)
    );
  }

  private setToken(token: string) {
    this.cookies.set(this.tokenKey, token, { path: '/' });
  }

  get token(): string | null {
    return this.cookies.get(this.tokenKey) || null;
  }

  private get decoded(): DecodedToken | null {
    const token = this.token;
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }

  get nombre(): string | null {
    return this.decoded?.name || null;
  }

  get email(): string | null {
    return this.decoded?.sub || null;
  }

  get rol(): string | null {
    return this.decoded?.role || null;
  }

  get id(): number | null {
    return this.decoded?.id ? +this.decoded.id : null;
  }

  estaLogueado(): boolean {
    return !!this.token;
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  get userId(): number | null {
    return this.id;
  }

  get userName(): string | null {
    return this.decoded?.name || null;
  }
}
