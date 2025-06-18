import { ApiResponse } from './../models/api/api-response.model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  UsuarioDto,
  AltaUsuarioDto,
  FiltroBusquedaUsuarioDto,
  Page
} from '../models';
import { BulkResponseDto } from '../models/bulk/bulk-response.dto';
import { ChangePasswordRequestDto } from '../models/auth/change-password-request.dto';
import { EditarUsuarioRequestDto } from '../models/users/editar-usuario-request.dto';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private base = `${environment.apiBaseUrl}/usuarios`;

  constructor(private http: HttpClient) { }

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
    return firstValueFrom(this.http.get<Page<UsuarioDto>>(this.base, { params }));
  }

  getById(id: number): Promise<UsuarioDto> {
    return firstValueFrom(this.http.get<ApiResponse<UsuarioDto>>(`${this.base}/${id}`))
      .then(resp => resp.data);
  }

  create(alta: AltaUsuarioDto): Promise<UsuarioDto> {
    return firstValueFrom(this.http.post<ApiResponse<UsuarioDto>>(this.base, alta))
      .then(resp => resp.data);
  }

  delete(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.base}/${id}`));
  }

  bulkUpload(file: File): Promise<BulkResponseDto> {
    const formData = new FormData();
    formData.append('file', file);
    return firstValueFrom(this.http.post<ApiResponse<BulkResponseDto>>(`${this.base}/bulk`, formData))
      .then(resp => resp.data);
  }

  buscarPorEmail(email: string): Promise<UsuarioDto> {
    return firstValueFrom(
      this.http.get<ApiResponse<UsuarioDto>>(`${this.base}/buscar`, {
        params: new HttpParams().set('email', email)
      })
    ).then(resp => resp.data);
  }

  changePassword(dto: ChangePasswordRequestDto): Promise<void> {
    return firstValueFrom(this.http.post<ApiResponse<void>>(`${this.base}/change-password`, dto))
      .then(() => { });
  }

  editProfile(id: number, dto: EditarUsuarioRequestDto): Promise<UsuarioDto> {
    return firstValueFrom(this.http.patch<ApiResponse<UsuarioDto>>(`${this.base}/${id}`, dto))
      .then(resp => resp.data);
  }

  update(updated: UsuarioDto): Promise<UsuarioDto> {
    const { id, ...dto } = updated;
    return firstValueFrom(this.http.patch<ApiResponse<UsuarioDto>>(`${this.base}/${id}`, dto))
      .then(resp => resp.data);
  }
}
