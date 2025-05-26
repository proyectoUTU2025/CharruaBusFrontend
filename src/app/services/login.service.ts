import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtPayload, jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private _jwt: string | null = null;
  private _decoded: JwtPayload & { name?: string; sub?: string; role?: string } = {};

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { email: string; password: string }) {
    return firstValueFrom(
      this.http.post<{ data: { token: string } }>('http://localhost:8080/auth/login', credentials)
    ).then(response => {
      this._jwt = response.data.token;
      this._decoded = jwtDecode(this._jwt);
    });
  }

  validateCode(email: string, code: string) {
    return firstValueFrom(
      this.http.post('http://localhost:8080/auth/verify-email', {
        email,
        verificationCode: code
      })
    );
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
