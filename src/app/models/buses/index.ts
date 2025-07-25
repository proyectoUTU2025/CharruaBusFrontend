export interface AsientoDto {
    id: number;
    numero: number;
    estado: string;
    omnibusId: number;
}

export interface BusDto {
    id: number;
    matricula: string;
    capacidad: number;
    activo: boolean;
    ubicacionActual: string;
    asientos: AsientoDto[];
}

export interface AltaBusDto {
    matricula: string;
    cantidadAsientos: number;
    localidadId: number;
}

export interface FiltroBusquedaBusDto {
    matricula?: string;
    minAsientos?: number;
    maxAsientos?: number;
    activo?: boolean;
    localidadId?: number;
    fechaHoraSalida?: string;
    fechaHoraLlegada?: string;
}

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

export interface FiltroDisponibilidadOmnibusDto {
    origenId: number;
    destinoId: number;
    fechaHoraSalida: string;
    fechaHoraLlegada: string;
    minAsientos?: number;
}
