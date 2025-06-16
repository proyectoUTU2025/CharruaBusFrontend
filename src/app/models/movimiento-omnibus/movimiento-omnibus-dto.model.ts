export interface MovimientoOmnibusDto {
    id: number;
    omnibusId: number;
    origenId: number;
    destinoId: number;
    fechaHoraSalida: string;
    fechaHoraLlegada: string;
    tipoMovimientoOmnibus: string;
    viajeId: number | null;
    mantenimientoId: number | null;
}
