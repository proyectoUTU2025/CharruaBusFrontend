import { TipoEstadoPasaje } from './tipo-estado-pasaje.enum';

export interface FiltroPasajeViajeDto {
    estados?: TipoEstadoPasaje[];
    fechaDesde?: string;
    fechaHasta?: string;
    origenId?: number;
    destinoId?: number;
    numeroAsiento?: number;
} 