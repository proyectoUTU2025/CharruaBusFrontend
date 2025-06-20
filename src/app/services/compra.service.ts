import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Page } from '../models/page';
import {
  CompraDto,
  DetalleCompraDto,
  FiltroBusquedaCompraDto,
  CompraRequestDto,
  CompraResponseDto
} from '../models/compra/compra.dto.model';

@Injectable({ providedIn: 'root' })
export class CompraService {
  private readonly BASE = '/api';

  constructor(private http: HttpClient) { }

  iniciarCompra(dto: CompraRequestDto): Observable<CompraResponseDto> {
    return this.http
      .post<{ data: CompraResponseDto }>(`${this.BASE}/compras`, dto)
      .pipe(map(r => r.data));
  }

  confirmarCompra(sessionId: string): Observable<{ compraId: number }> {
    return this.http
      .post<{ data: { compraId: number } }>(
        `${this.BASE}/compras/confirmar`,
        { sessionId }
      )
      .pipe(map(r => r.data));
  }

  cancelarCompra(sessionId: string): Observable<{ compraId: number }> {
    return this.http
      .post<{ data: { compraId: number } }>(
        `${this.BASE}/compras/cancelar`,
        { sessionId }
      )
      .pipe(map(r => r.data));
  }

  getHistorialCliente(
    clienteId: number,
    filtro: FiltroBusquedaCompraDto,
    page: number,
    size: number
  ): Observable<Page<CompraDto>> {
    let params = new HttpParams().set('page', page).set('size', size);
    Object.entries(filtro).forEach(([k, v]) => {
      if (v != null) params = params.set(k, String(v));
    });
    return this.http.get<Page<CompraDto>>(
      `${this.BASE}/usuarios/${clienteId}/compras`,
      { params }
    );
  }

  getDetalle(compraId: number): Observable<DetalleCompraDto> {
    return this.http
      .get<{ data: DetalleCompraDto }>(`${this.BASE}/compras/${compraId}/detalle`)
      .pipe(map(r => r.data));
  }
}
