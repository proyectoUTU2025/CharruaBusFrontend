import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { AltaViajeDto, ViajeDisponibleDto, FiltroBusquedaViajeDto } from '../models/viajes';
import { Page } from '../models';
@Injectable({ providedIn: 'root' })
export class ViajeService {
  private baseUrl = `${environment.apiBaseUrl}/viajes`;

  constructor(private http: HttpClient) {}

  buscar(filtro: FiltroBusquedaViajeDto, page = 0, size = 5): Promise<Page<ViajeDisponibleDto>> {
    let params = new HttpParams()
      .set('localidadOrigenId', filtro.localidadOrigenId.toString())
      .set('localidadDestinoId', filtro.localidadDestinoId.toString())
      .set('fechaDesde', filtro.fechaDesde)
      .set('fechaHasta', filtro.fechaHasta)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'fechaHoraSalida,asc');

    return firstValueFrom(
      this.http.get<Page<ViajeDisponibleDto>>(`${this.baseUrl}`, { params })
    );
  }

  altaViaje(dto: AltaViajeDto): Promise<void> {
    return firstValueFrom(this.http.post(`${this.baseUrl}`, dto))
      .then(() => {})
      .catch(err => {
        const message = err?.error?.message || 'Error desconocido al registrar el viaje';
        throw message;
      });
  }
}
