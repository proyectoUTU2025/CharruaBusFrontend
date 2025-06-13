import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PasajeDto } from '../models/pasaje.dto';
import { FiltroBusquedaPasajeDto } from '../models/filtro-busqueda-pasaje.dto';
import { Page } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PasajeService {
    private base = `${environment.apiBaseUrl}/pasajes`;

    constructor(private http: HttpClient) { }

    getHistorialPasajes(
        clienteId: number,
        filtro: FiltroBusquedaPasajeDto = {},
        page = 0,
        size = 10,
        sort = 'fechaCompra,desc'
    ): Promise<Page<PasajeDto>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sort', sort);

        if (filtro.fechaDesde) params = params.set('fechaDesde', filtro.fechaDesde.toISOString());
        if (filtro.fechaHasta) params = params.set('fechaHasta', filtro.fechaHasta.toISOString());
        if (filtro.origenId) params = params.set('origenId', filtro.origenId.toString());
        if (filtro.destinoId) params = params.set('destinoId', filtro.destinoId.toString());
        if (filtro.estados) filtro.estados.forEach(e => params = params.append('estados', e));

        return firstValueFrom(
            this.http.get<Page<PasajeDto>>(`${this.base}/cliente/${clienteId}`, { params })
        );
    }
}
