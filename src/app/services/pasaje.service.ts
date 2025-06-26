import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { PasajeDto } from '../models/pasajes/pasaje-dto.model';
import { FiltroBusquedaPasajeDto } from '../models/pasajes/filtro-busqueda-pasaje.dto';
import { ApiResponse } from '../models/api/api-response.model';

interface PageResponse<T> {
    content: T[];
    totalElements: number;
}

@Injectable({ providedIn: 'root' })
export class PasajeService {
    private base = `${environment.apiBaseUrl}/pasajes`;

    constructor(private http: HttpClient) { }

    getHistorialPasajes(
        clienteId: number,
        filtro: FiltroBusquedaPasajeDto,
        page = 0,
        size = 20
    ): Observable<PageResponse<PasajeDto>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (filtro.estados?.length) {
            params = params.set('estados', filtro.estados.join(','));
        }
        if (filtro.fechaDesde) {
            params = params.set('fechaDesde', filtro.fechaDesde);
        }
        if (filtro.fechaHasta) {
            params = params.set('fechaHasta', filtro.fechaHasta);
        }
        if (filtro.origenId != null) {
            params = params.set('origenId', filtro.origenId.toString());
        }
        if (filtro.destinoId != null) {
            params = params.set('destinoId', filtro.destinoId.toString());
        }

        return this.http.get<PageResponse<PasajeDto>>(
            `${this.base}/cliente/${clienteId}`,
            { params }
        );
    }

    getDetallePasaje(pasajeId: number): Observable<PasajeDto> {
        return this.http
            .get<ApiResponse<PasajeDto>>(`${this.base}/${pasajeId}`)
            .pipe(map(resp => resp.data));
    }

    descargarPdf(pasajeId: number): Observable<Blob> {
        return this.http.get(`${this.base}/${pasajeId}/pdf`, { responseType: 'blob' });
    }

    reembolsarPasaje(pasajeId: number): Observable<string> {
        return this.http
            .post<ApiResponse<string>>(`${this.base}/${pasajeId}/reembolsar`, {})
            .pipe(map(resp => resp.data));
    }
}
