export interface OmnibusDisponibleDto {
    id: number;
    matricula: string;
    capacidad: number;
    asientosDisponibles: number;
    origenId: number;
    origenNombre: string;
    destinoId: number;
    destinoNombre: string;
    fechaHoraSalida: string;
    fechaHoraLlegada: string;
    precio: number;
}
