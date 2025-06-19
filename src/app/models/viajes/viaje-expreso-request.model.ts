export interface ViajeExpresoRequest {
    omnibusId: number;
    destinoId: number;
    fechaHoraSalida: string;
    fechaHoraLlegada: string;
    confirm: boolean;
}
