import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AsignarMantenimientoDto } from '../models/buses/asignar-mantenimiento-dto.model';

@Injectable({ providedIn: 'root' })
export class MantenimientoService {
    private readonly baseUrl = '/api/mantenimientos';

    constructor(private http: HttpClient) { }

    asignarMantenimiento(dto: AsignarMantenimientoDto): Observable<any> {
        return this.http.post(this.baseUrl, dto);
    }
}
