import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AltaLocalidadDto, FiltroBusquedaLocalidadDto, LocalidadDto, Page } from '../models/localidades/localidades-dto.model';
import { ApiResponse } from '../models/api';
import { BulkResponseDto } from '../models/bulk/bulk-response.dto';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LocalidadService {
  private base = `${environment.apiBaseUrl}/localidades`;

  constructor(private http: HttpClient) {}

  getAll(filtro: FiltroBusquedaLocalidadDto = {}, page = 0, size = 10, sort = 'nombre,asc'): Observable<Page<LocalidadDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    Object.entries(filtro).forEach(([key, value]) => {
      if (value != null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<Page<LocalidadDto>>>(`${this.base}`, { params })
      .pipe(map(resp => resp.data));
  }

  create(localidad: AltaLocalidadDto): Observable<LocalidadDto> {
    return this.http.post<ApiResponse<LocalidadDto>>(`${this.base}`, localidad)
      .pipe(map(resp => resp.data));
  }

  bulkUpload(file: File): Observable<BulkResponseDto> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<BulkResponseDto>>(`${this.base}/bulk`, formData)
      .pipe(map(resp => resp.data));
  }
}
