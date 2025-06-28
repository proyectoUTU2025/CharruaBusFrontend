export interface MovimientoOmnibusDto {
    id: number;
    omnibusId: number;
    origenId: number;
    destinoId: number;
    fechaHoraSalida: Date;
    fechaHoraLlegada: Date;
    tipoMovimientoOmnibus: string;
    viajeId: number | null;
    mantenimientoId: number | null;
}
