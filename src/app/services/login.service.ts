import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtPayload, jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';

interface DecodedToken extends JwtPayload {
  name?: string;
  sub?: string;
  role?: string;
  id?: string;
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  constructor(
    private http: HttpClient,
    private router: Router,
    private cookies: CookieService
  ) {}

  login(credentials: { email: string; password: string }) {
    return firstValueFrom(
      this.http.post<{ data: { token: string } }>(
        `${environment.apiBaseUrl}/auth/login`,
        credentials
      )
    ).then(response => {
      const token = response.data.token;
      this.cookies.set('access_token', token, { path: '/' });
    }).catch(error => {
      console.error('Error during login:', error);
    });
  }

  validateCode(email: string, code: string) {
    return firstValueFrom(
      this.http.post(`${environment.apiBaseUrl}/auth/verify-email`, {
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
      this.http.post(`${environment.apiBaseUrl}/auth/registrar`, data)
    ).catch(error => {
      console.error('Error durante el registro:', error);
      throw error;
    });
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

  get token(): string | null {
    return this.cookies.get('access_token') || null;
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

  logout() {
    firstValueFrom(this.http.post(`${environment.apiBaseUrl}/auth/logout`, {}))
      .finally(() => {
        this.cookies.delete('access_token', '/');
        this.router.navigate(['/login']);
      });
  }
}
