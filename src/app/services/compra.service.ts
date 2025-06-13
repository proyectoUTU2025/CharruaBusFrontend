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
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CompraService {
  private base = `${environment.apiBaseUrl}/compras`;


  constructor(private http: HttpClient) {}

  iniciarCompra(dto: CompraRequestDto): Observable<{ data: CompraResponseDto }> {
    return this.http.post<{ data: CompraResponseDto }>(this.base, dto);
  }

  confirmarCompra(sessionId: string): Observable<any> {
    return this.http.post(`${this.base}/confirmar`, { sessionId } as ConfirmCompraRequestDto);
  }

  cancelarCompra(sessionId: string): Observable<any> {
    return this.http.post(`${this.base}/cancelar`, { sessionId } as CancelarCompraRequestDto);
  }

  getHistorialCliente(
    clienteId: number,
    filtro: FiltroBusquedaCompraDto,
    page = 0,
    size = 20
  ): Observable<{ content: CompraDto[]; totalElements: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filtro.estados) {
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

    return this.http.get<{ content: CompraDto[]; totalElements: number }>(
      `${this.base}/cliente/${clienteId}`, { params }
    );
  }

  getComprasVendedor(
    filtro: FiltroBusquedaCompraDto,
    page = 0,
    size = 20
  ): Observable<{ content: CompraDto[]; totalElements: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filtro.estados) {
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

    return this.http.get<{ content: CompraDto[]; totalElements: number }>(
      this.base, { params }
    );
  }

  getDetalle(compraId: number): Observable<{ data: DetalleCompraDto }> {
    return this.http.get<{ data: DetalleCompraDto }>(`${this.base}/${compraId}`);
  }
}
