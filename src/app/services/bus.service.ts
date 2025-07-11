import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, firstValueFrom, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { AltaBusDto, FiltroBusquedaBusDto, BusDto } from '../models/buses';
import { ApiResponse, Page } from '../models';
import { BulkResponseDto } from '../models/bulk/bulk-response.dto';
import { FiltroDisponibilidadOmnibusDto } from '../models/buses/filtro-disponibilidad-omnibus.dto';
import { FiltroDisponibilidadReasOmnibusDto } from '../models/buses/bus.model.dto';
import { MovimientoOmnibusDto } from '../models/movimiento-omnibus/movimiento-omnibus-dto.model';
import { FiltroViajeOmnibus } from '../models/movimiento-omnibus/filtro-viaje-omnibus.model';
import { OmnibusDisponibleDto } from '../models/buses/omnibus-disponible.dto';

@Injectable({
  providedIn: 'root'
})
export class BusService {
  private base = `${environment.apiBaseUrl}/omnibus`;

  constructor(private http: HttpClient) { }

  getAll(
    filtro: FiltroBusquedaBusDto = {},
    page = 0,
    size = 10,
    sort = 'matricula,asc'
  ): Promise<Page<BusDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    Object.entries(filtro).forEach(([k, v]) => {
      if (v != null && v !== '') {
        params = params.set(k, v.toString());
      }
    });
    return firstValueFrom(
      this.http.get<Page<BusDto>>(`${this.base}`, { params, withCredentials: true })
    );
  }

  create(alta: AltaBusDto): Promise<BusDto> {
    return firstValueFrom(
      this.http.post<ApiResponse<BusDto>>(`${this.base}`, alta, { withCredentials: true })
    ).then(resp => resp.data);
  }

  bulkUpload(file: File): Promise<BulkResponseDto> {
    const formData = new FormData();
    formData.append('file', file);
    return firstValueFrom(
      this.http.post<ApiResponse<BulkResponseDto>>(`${this.base}/bulk`, formData, { withCredentials: true })
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
      this.http.get<Page<OmnibusDisponibleDto>>(`${this.base}/disponibles`, { params, withCredentials: true })
    ).then(resp => resp.content);
  }

  getDisponiblesParaReasignacion(filtro: FiltroDisponibilidadReasOmnibusDto): Promise<OmnibusDisponibleDto[]> {
    let params = new HttpParams();
    Object.entries(filtro).forEach(([k, v]) => {
      if (v != null && v !== '') {
        params = params.set(k, v.toString());
      }
    });
    return firstValueFrom(
      this.http.get<Page<OmnibusDisponibleDto>>(`${this.base}/disponibles`, { params, withCredentials: true })
    ).then(resp => resp.content);
  }

  getById(id: number): Observable<BusDto> {
    return this.http
      .get<{ data: BusDto }>(`${this.base}/${id}`, { withCredentials: true })
      .pipe(map(res => res.data));
  }

  getTrips(
    busId: number,
    filtros: FiltroViajeOmnibus,
    page = 0,
    size = 10
  ): Observable<Page<MovimientoOmnibusDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filtros.fechaHoraSalida) {
      params = params.set('fechaHoraSalida', filtros.fechaHoraSalida);
    }
    if (filtros.fechaHoraLlegada) {
      params = params.set('fechaHoraLlegada', filtros.fechaHoraLlegada);
    }
    if (filtros.origenId) {
      params = params.set('origenId', filtros.origenId.toString());
    }
    if (filtros.destinoId) {
      params = params.set('destinoId', filtros.destinoId.toString());
    }
    if (filtros.tipos?.length) {
      filtros.tipos.forEach(tipo => {
        params = params.append('tipos', tipo);
      });
    }

    return this.http.get<Page<MovimientoOmnibusDto>>(
      `${this.base}/${busId}/movimientos`,
      { params, withCredentials: true }
    );
  }

  cambiarEstado(id: number, activo: boolean): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.patch<{ data: any; message: string }>(
        `${this.base}/${id}/estado?activo=${activo}`,
        {},
        { withCredentials: true }
      )
    ).then(res => ({ message: res?.message || 'Estado actualizado correctamente' }));
  }
}
