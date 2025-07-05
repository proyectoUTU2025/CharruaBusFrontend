import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Configuracion } from '../models/configuracion';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api';

interface Paged<T> { content: T[]; page: { totalElements: number; [key: string]: any }; }

@Injectable({ providedIn: 'root' })
export class ConfiguracionDelSistemaService {
    private baseUrl = `${environment.apiBaseUrl}/configuraciones`;

    constructor(private http: HttpClient) { }

    list(nombre?: string, page = 0, size = 20): Observable<Paged<Configuracion>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        if (nombre) {
            params = params.set('nombre', nombre);
        }
        return this.http.get<Paged<Configuracion>>(this.baseUrl, { params });
    }

    create(dto: { nombre: string; valorInt?: number; valor?: string }): Observable<Configuracion> {
        return this.http.post<Configuracion>(this.baseUrl, dto);
    }

    update(config: Configuracion): Observable<Configuracion> {
        return this.http.put<Configuracion>(`${this.baseUrl}/${config.id}`, config);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    findByNombre(nombre: string): Observable<Configuracion> {
        return this.http.get<ApiResponse<Configuracion>>(`${this.baseUrl}/nombre/${nombre}`)
            .pipe(map(response => response.data));
    }
}
