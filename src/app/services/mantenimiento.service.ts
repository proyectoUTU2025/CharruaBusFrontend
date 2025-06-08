import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AsignarMantenimientoDto {
    idOmnibus: number;
    motivo: string;
    fechaInicio: string; 
    fechaFin: string;    
}

@Injectable({ providedIn: 'root' })
export class MantenimientoService {
    private readonly baseUrl = '/api/mantenimientos';

    constructor(private http: HttpClient) { }

    asignarMantenimiento(dto: AsignarMantenimientoDto): Observable<any> {
        return this.http.post(this.baseUrl, dto);
    }
}
