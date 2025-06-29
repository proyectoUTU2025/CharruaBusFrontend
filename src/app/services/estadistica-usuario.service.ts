import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Page } from '../models';
import { EstadisticaUsuario } from '../models/estadisticas/usuario/estadistica-usuario';
import { EstadisticaClienteCompras } from '../models/estadisticas/usuario/estadistica-cliente-compras';
import { EstadisticaLogueos } from '../models/estadisticas/usuario/estadistica-logueos';

@Injectable({ providedIn: 'root' })
export class EstadisticaUsuarioService {
    private readonly BASE = `${environment.apiBaseUrl}/usuarios/estadisticas`;

    constructor(private http: HttpClient) { }

    /** Usuarios por tipo (paginado + ordenable) */
    getUsuariosPorTipo(
        page = 0,
        size = 10,
        ordenarPor = 'tipo',
        ascendente = true
    ): Observable<Page<EstadisticaUsuario>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('ordenarPor', ordenarPor)
            .set('ascendente', ascendente.toString());
        return this.http.get<Page<EstadisticaUsuario>>(
            `${this.BASE}/tipo`,
            { params }
        );
    }

    exportUsuariosPorTipoCsv(): Observable<Blob> {
        return this.http.get(
            `${this.BASE}/tipo/export/csv`,
            { responseType: 'blob' }
        );
    }

    exportUsuariosPorTipoPdf(): Observable<Blob> {
        return this.http.get(
            `${this.BASE}/tipo/export/pdf`,
            { responseType: 'blob' }
        );
    }

    /** Compras por cliente (paginado + ordenable) */
    getComprasClientes(
        fechaInicio?: string,
        fechaFin?: string,
        page = 0,
        size = 10,
        ordenarPor = 'totalGastado',
        ascendente = false
    ): Observable<Page<EstadisticaClienteCompras>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('ordenarPor', ordenarPor)
            .set('ascendente', ascendente.toString());
        if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
        if (fechaFin) params = params.set('fechaFin', fechaFin);
        return this.http.get<Page<EstadisticaClienteCompras>>(
            `${this.BASE}/compras-clientes`,
            { params }
        );
    }

    exportComprasClientesCsv(
        fechaInicio?: string,
        fechaFin?: string
    ): Observable<Blob> {
        let params = new HttpParams();
        if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
        if (fechaFin) params = params.set('fechaFin', fechaFin);
        return this.http.get(
            `${this.BASE}/compras-clientes/export/csv`,
            { params, responseType: 'blob' }
        );
    }

    exportComprasClientesPdf(
        fechaInicio?: string,
        fechaFin?: string
    ): Observable<Blob> {
        let params = new HttpParams();
        if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
        if (fechaFin) params = params.set('fechaFin', fechaFin);
        return this.http.get(
            `${this.BASE}/compras-clientes/export/pdf`,
            { params, responseType: 'blob' }
        );
    }

    getLogueosUsuarios(
        fechaInicio?: string,
        fechaFin?: string,
        page = 0,
        size = 10,
        ordenarPor = 'email',
        ascendente = true
    ): Observable<Page<EstadisticaLogueos>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('ordenarPor', ordenarPor)
            .set('ascendente', ascendente.toString());
        if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
        if (fechaFin) params = params.set('fechaFin', fechaFin);
    
        return this.http.get<Page<EstadisticaLogueos>>(
            `${this.BASE}/logueos`,
            { params }
        );
    }

    exportLogueosCsv(
        fechaInicio?: string,
        fechaFin?: string
    ): Observable<Blob> {
        let params = new HttpParams();
        if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
        if (fechaFin) params = params.set('fechaFin', fechaFin);
        return this.http.get(
            `${this.BASE}/logueos/export/csv`,
            { params, responseType: 'blob' }
        );
    }

    exportLogueosPdf(
        fechaInicio?: string,
        fechaFin?: string
    ): Observable<Blob> {
        let params = new HttpParams();
        if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
        if (fechaFin) params = params.set('fechaFin', fechaFin);
        return this.http.get(
            `${this.BASE}/logueos/export/pdf`,
            { params, responseType: 'blob' }
        );
    }
}
