import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AltaBusDto, FiltroBusquedaBusDto, BusDto, FiltroDisponibilidadOmnibusDto, OmnibusDisponibleDto } from '../models/buses';
import { Page } from '../models';
import { ApiResponse } from '../models/api';
import { BulkResponseDto } from '../models/bulk/bulk-response.dto';

@Injectable({ providedIn: 'root' })
export class BusService {
  private base = `${environment.apiBaseUrl}/omnibus`;

  constructor(private http: HttpClient) {}

  getAll(filtro: FiltroBusquedaBusDto = {}, page = 0, size = 10, sort = 'matricula,asc'): Promise<Page<BusDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    Object.entries(filtro).forEach(([k, v]) => {
      if (v != null && v !== '') {
        params = params.set(k, v.toString());
      }
    });

    return firstValueFrom(this.http.get<Page<BusDto>>(`${this.base}`, { params }));
  }

  create(alta: AltaBusDto): Promise<BusDto> {
    return firstValueFrom(
      this.http.post<ApiResponse<BusDto>>(`${this.base}`, alta)
    ).then(resp => resp.data);
  }

  bulkUpload(file: File): Promise<BulkResponseDto> {
    const formData = new FormData();
    formData.append('file', file);
    return firstValueFrom(
      this.http.post<ApiResponse<BulkResponseDto>>(`${this.base}/bulk`, formData)
    ).then(resp => resp.data);
  }
  

  getDisponibles(filtro: FiltroDisponibilidadOmnibusDto): Promise<OmnibusDisponibleDto[]> {
    let params = new HttpParams();

    Object.entries(filtro).forEach(([k, v]) => {
      if (v != null && v !== '') {
        params = params.set(k, v.toString());
      }
    });

    return firstValueFrom(
      this.http.get<Page<OmnibusDisponibleDto>>(`${this.base}/disponibles`, { params })
    ).then(resp => resp.content);
  }

}
