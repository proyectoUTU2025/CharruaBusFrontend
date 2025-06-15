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
    private cookies: CookieService
  ) { }



  async login(email: string, password: string): Promise<void> {
    const resp = await firstValueFrom(
      this.http.post<{ data: AuthenticationResponseDto }>(
        `${this.base}/login`,
        { email, password } as LoginRequestDto
      )
    );
    this.setToken(resp.data.token);
  }

  logout(): void {
    this.cookies.delete(this.tokenKey, '/');
  }

  register(dto: RegisterRequestDto): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${this.base}/registrar`, dto)
    );
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

  get decoded(): DecodedToken | null {
    const t = this.token;
    if (!t) return null;
    try {
      return jwtDecode<DecodedToken>(t);
    } catch {
      return null;
    }
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }


  get id(): number | null {
    return this.decoded?.id ? +this.decoded.id : null;
  }
  get rol(): string | null {
    return this.decoded?.role || null;
  }


  get userId(): number | null {
    return this.id;
  }
  get userName(): string | null {
    return this.decoded?.name || null;
  }
}
