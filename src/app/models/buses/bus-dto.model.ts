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
