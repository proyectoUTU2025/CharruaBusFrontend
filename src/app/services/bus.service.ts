import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BusDto } from '../models/buses/bus-dto.model';
import { Page } from '../models/page.model';
import { MovimientoOmnibusDto } from '../models/movimiento-omnibus/movimiento-omnibus-dto.model';
import { Observable, map } from 'rxjs';
import { FiltroViajeOmnibus } from '../models/movimiento-omnibus/filtro-viaje-omnibus.model';

@Injectable({
  providedIn: 'root'
})
export class BusService {
  private baseUrl = '/api/omnibus';

  constructor(private http: HttpClient) { }

  getAll(filtro: any, page: number, size: number): Promise<Page<BusDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filtro.matricula) params = params.set('matricula', filtro.matricula);
    if (filtro.localidadId != null) params = params.set('localidadId', filtro.localidadId.toString());
    if (filtro.minAsientos != null) params = params.set('minAsientos', filtro.minAsientos.toString());
    if (filtro.maxAsientos != null) params = params.set('maxAsientos', filtro.maxAsientos.toString());
    if (filtro.activo != null) params = params.set('activo', filtro.activo.toString());

    return this.http.get<Page<BusDto>>(this.baseUrl, { params })
      .toPromise()
      .then(result => {
        if (!result) throw new Error('Received undefined response from API');
        return result;
      });
  }

  create(alta: { matricula: string; cantidadAsientos: number; localidadId: number }): Promise<void> {
    return this.http.post<void>(this.baseUrl, alta).toPromise();
  }

  bulkUpload(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.baseUrl}/bulk`, formData).toPromise();
  }

  getById(id: number): Observable<BusDto> {
    return this.http.get<{ data: BusDto }>(`${this.baseUrl}/${id}`).pipe(
      map(res => res.data)
    );
  }



  getTrips(
    busId: number,
    filtros: FiltroViajeOmnibus,
    page: number,
    size: number
  ): Observable<Page<MovimientoOmnibusDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filtros.fechaHoraSalida) params = params.set('fechaHoraSalida', filtros.fechaHoraSalida);
    if (filtros.origenId) params = params.set('origenId', filtros.origenId);
    if (filtros.destinoId) params = params.set('destinoId', filtros.destinoId);
    if (filtros.tipos && filtros.tipos.length > 0) {
      filtros.tipos.forEach(tipo => {
        params = params.append('tipos', tipo);
      });
    }

    return this.http.get<Page<MovimientoOmnibusDto>>(
      `${this.baseUrl}/${busId}/movimientos`,
      { params }
    );


  }

  cambiarEstado(id: number, activo: boolean): Promise<{ message: string }> {
    return this.http.patch<{ data: any; message: string }>(
      `${this.baseUrl}/${id}/estado?activo=${activo}`,
      {}
    )
      .toPromise()
      .then(res => {
        if (!res) {
          return { message: 'Estado actualizado correctamente' };
        }
        return { message: res.message || 'Estado actualizado correctamente' };
      });
  }

}
