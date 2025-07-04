import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AsignarMantenimientoDto } from '../models/buses/asignar-mantenimiento-dto.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MantenimientoService {
    private readonly baseUrl = `${environment.apiBaseUrl}/mantenimientos`;

    constructor(private http: HttpClient) { }

    asignarMantenimiento(dto: AsignarMantenimientoDto): Observable<any> {
        return this.http.post(this.baseUrl, dto);
    }
}
