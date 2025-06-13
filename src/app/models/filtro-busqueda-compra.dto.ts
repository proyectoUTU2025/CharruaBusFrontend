export interface FiltroBusquedaCompraDto {
    estados?: string[];
    fechaDesde?: Date;
    fechaHasta?: Date;
    montoMin?: number;
    montoMax?: number;
}
