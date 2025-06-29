import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../models';
import { EstadisticaViajePorDepartamento } from '../models/estadisticas/transporte/estadistica-viaje-departamento';
import { EstadisticaOmnibus } from '../models/estadisticas/transporte/estadistica-omnibus';
import { EstadisticaPasaje } from '../models/estadisticas/transporte/estadistica-pasaje';
import { TipoDepartamento } from '../models/estadisticas/transporte/tipo-departamento';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EstadisticaTransporteService {
    private readonly BASE = `${environment.apiBaseUrl}`;

    constructor(private http: HttpClient) {}

    getViajesPorDepartamento(
        fechaInicio?: string,
        fechaFin?: string,
        origen?: TipoDepartamento,
        destino?: TipoDepartamento,
        page = 0,
        size = 10,
        ordenarPor = 'departamento',
        ascendente = true
    ): Observable<Page<EstadisticaViajePorDepartamento>> {
        let params = new HttpParams()
        .set('page', page)
        .set('size', size)
        .set('ordenarPor', ordenarPor)
        .set('ascendente', ascendente);
        if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
        if (fechaFin) params = params.set('fechaFin', fechaFin);
        if (origen) params = params.set('origen', origen);
        if (destino) params = params.set('destino', destino);

        return this.http.get<Page<EstadisticaViajePorDepartamento>>(
        `${this.BASE}/viajes/departamento`, { params }
        );
    }

    exportViajesPorDepartamentoCsv(options: any): Observable<Blob> {
        let params = new HttpParams({ fromObject: options });
        return this.http.get(
        `${this.BASE}/viajes/departamento/export/csv`,
        { params, responseType: 'blob' }
        );
    }

    exportViajesPorDepartamentoPdf(options: any): Observable<Blob> {
        let params = new HttpParams({ fromObject: options });
        return this.http.get(
        `${this.BASE}/viajes/departamento/export/pdf`,
        { params, responseType: 'blob' }
        );
    }

    getViajesPorOmnibus(
        fechaInicio?: string,
        fechaFin?: string,
        page = 0,
        size = 10,
        ordenarPor = 'matricula',
        ascendente = true
    ): Observable<Page<EstadisticaOmnibus>> {
        let params = new HttpParams()
        .set('page', page)
        .set('size', size)
        .set('ordenarPor', ordenarPor)
        .set('ascendente', ascendente);
        if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
        if (fechaFin) params = params.set('fechaFin', fechaFin);

        return this.http.get<Page<EstadisticaOmnibus>>(
        `${this.BASE}/omnibus/viajes`, { params }
        );
    }

    exportViajesPorOmnibusCsv(options: any): Observable<Blob> {
        let params = new HttpParams({ fromObject: options });
        return this.http.get(
        `${this.BASE}/omnibus/viajes/export/csv`,
        { params, responseType: 'blob' }
        );
    }

    exportViajesPorOmnibusPdf(options: any): Observable<Blob> {
        let params = new HttpParams({ fromObject: options });
        return this.http.get(
        `${this.BASE}/omnibus/viajes/export/pdf`,
        { params, responseType: 'blob' }
        );
    }

    getMantenimientosPorOmnibus(
        fechaInicio?: string,
        fechaFin?: string,
        page = 0,
        size = 10,
        ordenarPor = 'matricula',
        ascendente = true
    ): Observable<Page<EstadisticaOmnibus>> {
        let params = new HttpParams()
        .set('page', page)
        .set('size', size)
        .set('ordenarPor', ordenarPor)
        .set('ascendente', ascendente);
        if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
        if (fechaFin) params = params.set('fechaFin', fechaFin);

        return this.http.get<Page<EstadisticaOmnibus>>(
        `${this.BASE}/omnibus/mantenimientos`, { params }
        );
    }

    exportMantenimientosPorOmnibusCsv(options: any): Observable<Blob> {
        let params = new HttpParams({ fromObject: options });
        return this.http.get(
        `${this.BASE}/omnibus/mantenimientos/export/csv`,
        { params, responseType: 'blob' }
        );
    }

    exportMantenimientosPorOmnibusPdf(options: any): Observable<Blob> {
        let params = new HttpParams({ fromObject: options });
        return this.http.get(
        `${this.BASE}/omnibus/mantenimientos/export/pdf`,
        { params, responseType: 'blob' }
        );
    }

    getEstadisticaPasajes(
        fechaInicio?: string,
        fechaFin?: string,
        origen?: TipoDepartamento,
        destino?: TipoDepartamento
    ): Observable<EstadisticaPasaje> {
        let params = new HttpParams();
        if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
        if (fechaFin) params = params.set('fechaFin', fechaFin);
        if (origen) params = params.set('origen', origen);
        if (destino) params = params.set('destino', destino);

        return this.http.get<EstadisticaPasaje>(
        `${this.BASE}/pasajes/estadisticas`, { params }
        );
    }

    exportEstadisticaPasajesCsv(options: any): Observable<Blob> {
        let params = new HttpParams({ fromObject: options });
        return this.http.get(
        `${this.BASE}/pasajes/estadisticas/export/csv`,
        { params, responseType: 'blob' }
        );
    }

    exportEstadisticaPasajesPdf(options: any): Observable<Blob> {
        let params = new HttpParams({ fromObject: options });
        return this.http.get(
            `${this.BASE}/pasajes/estadisticas/export/pdf`,
            { params, responseType: 'blob' }
        );
    }

    getPasajesAgrupados(
        fechaInicio?: string,
        fechaFin?: string,
        origen?: TipoDepartamento,
        destino?: TipoDepartamento,
        page = 0,
        size = 10,
        ordenarPor = 'vendidos',
        ascendente = true
    ): Observable<Page<EstadisticaPasaje>> {
        let params = new HttpParams()
        .set('page', page)
        .set('size', size)
        .set('ordenarPor', ordenarPor)
        .set('ascendente', ascendente);
        if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
        if (fechaFin) params = params.set('fechaFin', fechaFin);
        if (origen) params = params.set('origen', origen);
        if (destino) params = params.set('destino', destino);

        return this.http.get<Page<EstadisticaPasaje>>(
        `${this.BASE}/pasajes/estadisticas/agrupado`, { params }
        );
    }

    exportPasajesAgrupadosCsv(options: any): Observable<Blob> {
        let params = new HttpParams({ fromObject: options });
        return this.http.get(
        `${this.BASE}/pasajes/estadisticas/agrupado/export/csv`,
        { params, responseType: 'blob' }
        );
    }

    exportPasajesAgrupadosPdf(options: any): Observable<Blob> {
        let params = new HttpParams({ fromObject: options });
        return this.http.get(
            `${this.BASE}/pasajes/estadisticas/agrupado/export/pdf`,
            { params, responseType: 'blob' }
        );
    }

}
