import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Viaje } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ViajeService {
  private readonly baseUrl = '/api/viajes';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Viaje[]> {
    return this.http.get<Viaje[]>(this.baseUrl);
  }


  getPage(
    page: number,
    size: number,
    filtros?: { fechaSalida?: string; origen?: string; destino?: string }
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filtros?.fechaSalida) {
      params = params.set('fechaSalida', filtros.fechaSalida);
    }
    if (filtros?.origen) {
      params = params.set('origen', filtros.origen);
    }
    if (filtros?.destino) {
      params = params.set('destino', filtros.destino);
    }

    return this.http.get<any>(this.baseUrl, { params });
  }


  addViaje(viaje: Viaje): Observable<Viaje> {
    return this.http.post<Viaje>(this.baseUrl, viaje);
  }
}
