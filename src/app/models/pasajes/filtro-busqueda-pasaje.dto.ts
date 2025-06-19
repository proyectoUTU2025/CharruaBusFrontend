import { TipoEstadoPasaje } from './tipo-estado-pasaje.enum';

export interface FiltroBusquedaPasajeDto {
    estados?: TipoEstadoPasaje[];
    fechaDesde?: string;
    fechaHasta?: string;
    origenId?: number;
    destinoId?: number;
}
