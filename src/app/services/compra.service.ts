// src/app/services/compra.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CompraDto } from '../models/compra.dto';
import { FiltroBusquedaCompraDto } from '../models/filtro-busqueda-compra.dto';
import { Page } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CompraService {
    private base = `${environment.apiBaseUrl}/compras`;

    constructor(private http: HttpClient) { }


    getHistorial(
        clienteId: number,
        filtro: FiltroBusquedaCompraDto = {},
        page = 0,
        size = 10,
        sort = 'fechaCompra,desc'
    ): Promise<Page<CompraDto>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sort', sort);


        if (filtro.estados) filtro.estados.forEach(e => params = params.append('estados', e));
        if (filtro.fechaDesde) params = params.set('fechaDesde', filtro.fechaDesde.toISOString());
        if (filtro.fechaHasta) params = params.set('fechaHasta', filtro.fechaHasta.toISOString());
        if (filtro.montoMin != null) params = params.set('montoMin', filtro.montoMin.toString());
        if (filtro.montoMax != null) params = params.set('montoMax', filtro.montoMax.toString());

        return firstValueFrom(
            this.http.get<Page<CompraDto>>(`${this.base}/cliente/${clienteId}`, { params })
        );
    }
}
