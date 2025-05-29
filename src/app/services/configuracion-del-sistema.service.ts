import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Configuracion } from '../models/configuracion';
import { environment } from '../../environments/environment';

interface Paged<T> { content: T[]; totalElements: number; }

@Injectable({ providedIn: 'root' })
export class ConfiguracionDelSistemaService {
    private baseUrl = `${environment.apiUrl}/configuraciones`;

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

    update(config: Configuracion): Observable<Configuracion> {
        return this.http.put<Configuracion>(
            `${this.baseUrl}/${config.id}`,
            config
        );
    }
}
