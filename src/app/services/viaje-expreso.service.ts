import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ViajeExpresoRequest } from '../models/viajes/viaje-expreso-request.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ViajeExpresoService {
    private readonly baseUrl = '/api/movimiento-omnibus/expreso';

    constructor(private http: HttpClient) { }

    crearViajeExpreso(dto: ViajeExpresoRequest): Observable<any> {
        return this.http.post(this.baseUrl, dto);
    }
}
