import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models';
import { Configuracion } from '../models/configuracion';
import { environment } from '../../environments/environment';

interface Paged<T> {
    content: T[];
    totalElements: number;
}

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
        return this.http.get<Paged<Configuracion>>(this.baseUrl, {
            params,
            withCredentials: true
        });
    }

    create(dto: { nombre: string; valorInt?: number; valor?: string }): Observable<Configuracion> {
        return this.http
            .post<ApiResponse<Configuracion>>(this.baseUrl, dto, { withCredentials: true })
            .pipe(map(resp => resp.data));
    }

    update(config: Configuracion): Observable<Configuracion> {
        return this.http
            .put<ApiResponse<Configuracion>>(`${this.baseUrl}/${config.id}`, config, { withCredentials: true })
            .pipe(map(resp => resp.data));
    }

    delete(id: number): Observable<void> {
        return this.http
            .delete<ApiResponse<void>>(`${this.baseUrl}/${id}`, { withCredentials: true })
            .pipe(map(() => { }));
    }
}
