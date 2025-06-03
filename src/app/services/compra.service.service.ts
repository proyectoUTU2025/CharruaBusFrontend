import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CompraRequestDto, CompraResponseDto } from '../models';


@Injectable({ providedIn: 'root' })
export class CompraService {
  private readonly url = '/compras';

  constructor(private http: HttpClient) {}

  iniciarCompra(dto: CompraRequestDto) {
    return this.http.post<{ data: CompraResponseDto }>(this.url, dto);
  }
}
