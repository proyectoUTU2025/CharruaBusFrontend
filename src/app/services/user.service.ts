import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  UsuarioDto,
  AltaUsuarioDto,
  FiltroBusquedaUsuarioDto,
  Page,
} from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private base = 'http://localhost:8080/usuarios';

  constructor(private http: HttpClient) {}
 
  getAll(
    filtro: FiltroBusquedaUsuarioDto = {},
    page = 0,
    size = 10
  ): Promise<Page<UsuarioDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    Object.entries(filtro).forEach(([k, v]) => {
      if (v != null && v !== '') {
        Array.isArray(v)
          ? v.forEach(val => (params = params.append(k, val)))
          : (params = params.set(k, v.toString()));
      }
    });

    return firstValueFrom(this.http.get<Page<UsuarioDto>>(this.base, { params }));
  }

  create(alta: AltaUsuarioDto): Promise<UsuarioDto> {
    return firstValueFrom(this.http.post<UsuarioDto>(this.base, alta));
  }

  update(u: UsuarioDto): Promise<UsuarioDto> {
    return firstValueFrom(
      this.http.put<UsuarioDto>(`${this.base}/${u.id}`, u)
    );
  }

  delete(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.base}/${id}`));
  }
}
