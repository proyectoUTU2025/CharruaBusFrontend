import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../models/api';
import { AltaViajeDto, ViajeDisponibleDto, FiltroBusquedaViajeDto } from '../models/viajes';

@Injectable({ providedIn: 'root' })
export class ViajeService {
  private baseUrl = `${environment.apiBaseUrl}/viajes`;

  constructor(private http: HttpClient) {}

  buscar(filtro: FiltroBusquedaViajeDto): Promise<ViajeDisponibleDto[]> {
    const fechaStr =
      filtro.fechaViaje instanceof Date
        ? filtro.fechaViaje.toISOString().split('T')[0]
        : filtro.fechaViaje;

    const params = new HttpParams()
      .set('idLocalidadOrigen', filtro.idLocalidadOrigen)
      .set('idLocalidadDestino', filtro.idLocalidadDestino)
      .set('fechaViaje', fechaStr)
      .set('cantidadPasajes', filtro.cantidadPasajes);

    return firstValueFrom(this.http.get<ViajeDisponibleDto[]>(`${this.baseUrl}/buscar`, { params }));
  }

  altaViaje(dto: AltaViajeDto): Promise<void> {
    return firstValueFrom(
      this.http.post<ApiResponse<any>>(`${this.baseUrl}`, dto)
    ).then(() => {});
  }
}
