export interface FiltroDisponibilidadOmnibusDto {
    origenId: number;
    destinoId: number;
    fechaHoraSalida: string;
    fechaHoraLlegada: string;
    minAsientos?: number;
}
