import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models';
import { MantenimientoDto } from '../models/buses/mantenimiento-dto';
import { AsignarMantenimientoDto } from '../models/buses/asignar-mantenimiento-dto.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MantenimientoService {
    private readonly base = `${environment.apiBaseUrl}/mantenimientos`;

    constructor(private http: HttpClient) { }

    asignarMantenimiento(
        dto: AsignarMantenimientoDto
    ): Observable<ApiResponse<MantenimientoDto>> {
        return this.http.post<ApiResponse<MantenimientoDto>>(
            this.base,
            dto,
            { withCredentials: true }
        );
    }
}
