export interface FiltroBusquedaPasajeDto {
    fechaDesde?: Date;
    fechaHasta?: Date;
    origenId?: number;
    destinoId?: number;
    estados?: string[];           
}
