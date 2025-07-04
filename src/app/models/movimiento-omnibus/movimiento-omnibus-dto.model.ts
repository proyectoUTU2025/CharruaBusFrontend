export interface MovimientoOmnibusDto {
    id: number;
    omnibusId: number;
    origenId: number;
    destinoId: number;
    origen: string;
    destino: string;
    fechaHoraSalida: Date;
    fechaHoraLlegada: Date;
    tipoMovimientoOmnibus: string;
    viajeId: number | null;
    mantenimientoId: number | null;
}
