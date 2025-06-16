import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import {
  UsuarioDto,
  AltaUsuarioDto,
  FiltroBusquedaUsuarioDto,
  Page
} from '../models';
import { ApiResponse } from '../models/api';
import { environment } from '../../environments/environment';
import { BulkResponseDto } from '../models/bulk/bulk-response.dto';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserService {
  private base = `${environment.apiBaseUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  getAll(
    filtro: FiltroBusquedaUsuarioDto = {},
    page = 0,
    size = 10,
    sort = 'nombre,asc'
  ): Promise<Page<UsuarioDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    Object.entries(filtro).forEach(([k, v]) => {
      if (v != null && v !== '') {
        Array.isArray(v)
          ? v.forEach(val => (params = params.append(k, val)))
          : (params = params.set(k, v.toString()));
      }
    });

    return firstValueFrom(
      this.http.get<Page<UsuarioDto>>(this.base, { params })
    );
  }

  create(alta: AltaUsuarioDto): Promise<UsuarioDto> {
    return firstValueFrom(
      this.http
        .post<ApiResponse<UsuarioDto>>(`${this.base}`, alta)
    ).then(resp => resp.data);
  }

  update(u: UsuarioDto): Promise<UsuarioDto> {
    return firstValueFrom(
      this.http
        .put<ApiResponse<UsuarioDto>>(`${this.base}/${u.id}`, u)
    ).then(resp => resp.data);
  }

  delete(id: number): Promise<void> {
    return firstValueFrom(
      this.http
        .delete<void>(`${this.base}/${id}`)
    );
  }

  bulkUpload(file: File): Promise<BulkResponseDto> {
    const formData = new FormData();
    formData.append('file', file);
    return firstValueFrom(
      this.http
        .post<ApiResponse<BulkResponseDto>>(`${this.base}/bulk`, formData)
    ).then(resp => resp.data);
  }
  
  getById(id: number): Promise<UsuarioDto> {
    return firstValueFrom(
      this.http.get<ApiResponse<UsuarioDto>>(`${this.base}/${id}`)
    ).then(resp => resp.data);
  }

  buscarPorEmail(email: string) {
    return firstValueFrom(
      this.http.get<UsuarioDto>(`${this.base}/buscar?email=${email}`)
    );
  }

  buscarClientes(query: string, page = 0, size = 5): Observable<UsuarioDto[]> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'email,ASC');

    return this.http.get<Page<UsuarioDto>>(`${this.base}/buscar-cliente`, { params })
      .pipe(
        map(resp => resp.content ?? [])
      );
  }
}
