import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models';
import { MantenimientoDto } from '../models/buses/mantenimiento-dto';
import { AsignarMantenimientoDto } from '../models/buses/asignar-mantenimiento-dto.model';

@Injectable({ providedIn: 'root' })
export class MantenimientoService {
    private readonly baseUrl = '/api/mantenimientos';

    constructor(private http: HttpClient) { }

    asignarMantenimiento(
        dto: AsignarMantenimientoDto
    ): Observable<ApiResponse<MantenimientoDto>> {
        return this.http.post<ApiResponse<MantenimientoDto>>(
            this.baseUrl,
            dto,
            { withCredentials: true }
        );
    }
}
