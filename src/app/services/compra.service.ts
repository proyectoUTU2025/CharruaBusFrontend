import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  CompraRequestDto,
  CompraResponseDto,
  ConfirmCompraRequestDto,
  CancelarCompraRequestDto,
  CompraDto,
  DetalleCompraDto,
  FiltroBusquedaCompraDto
} from '../models';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

interface PageResponse<T> {
  content: T[];
  totalElements: number;
}

@Injectable({ providedIn: 'root' })
export class CompraService {
  private base = `${environment.apiBaseUrl}/compras`;

  constructor(private http: HttpClient) { }

  iniciarCompra(
    dto: CompraRequestDto
  ): Observable<{ data: CompraResponseDto }> {
    return this.http.post<{ data: CompraResponseDto }>(this.base, dto);
  }

  confirmarCompra(
    sessionId: string
  ): Observable<{ data: CompraResponseDto }> {
    return this.http.post<{ data: CompraResponseDto }>(
      `${this.base}/confirmar`,
      { sessionId } as ConfirmCompraRequestDto
    );
  }

  cancelarCompra(
    sessionId: string
  ): Observable<{ data: CompraResponseDto }> {
    return this.http.post<{ data: CompraResponseDto }>(
      `${this.base}/cancelar`,
      { sessionId } as CancelarCompraRequestDto
    );
  }

  getHistorialCliente(
    clienteId: number,
    filtro: FiltroBusquedaCompraDto,
    page = 0,
    size = 20
  ): Observable<PageResponse<CompraDto>> {
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
    if (filtro.montoMin != null) {
      params = params.set('montoMin', filtro.montoMin.toString());
    }
    if (filtro.montoMax != null) {
      params = params.set('montoMax', filtro.montoMax.toString());
    }

    return this.http.get<PageResponse<CompraDto>>(
      `${this.base}/cliente/${clienteId}`,
      { params }
    );
  }

  getComprasVendedor(
    filtro: FiltroBusquedaCompraDto,
    page = 0,
    size = 20
  ): Observable<PageResponse<CompraDto>> {
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
    if (filtro.montoMin != null) {
      params = params.set('montoMin', filtro.montoMin.toString());
    }
    if (filtro.montoMax != null) {
      params = params.set('montoMax', filtro.montoMax.toString());
    }

    return this.http.get<PageResponse<CompraDto>>(this.base, { params });
  }

  getDetalle(
    compraId: number
  ): Observable<{ data: DetalleCompraDto }> {
    return this.http.get<{ data: DetalleCompraDto }>(
      `${this.base}/${compraId}`
    );
  }
}
