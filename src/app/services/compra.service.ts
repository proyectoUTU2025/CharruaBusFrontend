import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  CompraRequestDto,
  CompraResponseDto,
  ConfirmCompraRequestDto,
  CancelarCompraRequestDto,
  CompraDto,
  DetalleCompraDto,
  FiltroBusquedaCompraDto
} from '../models';

@Injectable({ providedIn: 'root' })
export class CompraService {
  private base = `${environment.apiBaseUrl}/compras`;

  constructor(private http: HttpClient) { }

  iniciarCompra(dto: CompraRequestDto): Observable<CompraResponseDto> {
    return this.http
      .post<{ data: CompraResponseDto }>(this.base, dto)
      .pipe(map(resp => resp.data));
  }

  confirmarCompra(sessionId: string): Observable<CompraResponseDto> {
    return this.http
      .post<{ data: CompraResponseDto }>(
        `${this.base}/confirmar`,
        { sessionId } as ConfirmCompraRequestDto
      )
      .pipe(map(r => r.data));
  }


  cancelarCompra(sessionId: string): Observable<CompraResponseDto> {
    return this.http
      .post<{ data: CompraResponseDto }>(
        `${this.base}/cancelar`,
        { sessionId } as CancelarCompraRequestDto
      )
      .pipe(map(r => r.data));
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

    if (filtro.estados) params = params.set('estados', filtro.estados.join(','));
    if (filtro.fechaDesde) params = params.set('fechaDesde', filtro.fechaDesde);
    if (filtro.fechaHasta) params = params.set('fechaHasta', filtro.fechaHasta);
    if (filtro.montoMin != null) params = params.set('montoMin', filtro.montoMin.toString());
    if (filtro.montoMax != null) params = params.set('montoMax', filtro.montoMax.toString());

    return this.http.get<{ content: CompraDto[]; totalElements: number }>(
      `${this.base}/cliente/${clienteId}`,
      { params }
    );
  }

  getDetalle(compraId: number): Observable<DetalleCompraDto> {
    return this.http
      .get<{ data: DetalleCompraDto }>(`${this.base}/${compraId}`)
      .pipe(map(resp => resp.data));
  }

  descargarPdf(compraId: number): Observable<Blob> {
    return this.http.get(
      `${this.base}/${compraId}/pdf`,
      { responseType: 'blob' }
    );
  }

  reembolsarCompra(compraId: number): Observable<string> {
    return this.http
      .post<{ message: string }>(`${this.base}/${compraId}/reembolsar`, {})
      .pipe(map(resp => resp.message));
  }
}
