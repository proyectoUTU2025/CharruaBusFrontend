export interface ViajeDisponibleDto {
  idViaje: number;
  origen: string;
  destino: string;
  fechaHoraSalida: string;
  fechaHoraLlegada: string;
  asientosDisponibles: number;
  precioEstimado: number;
}

export interface AltaParadaDto {
  localidadId: number;
  orden: number;
}

export interface AltaViajeDto {
  omnibusId: number;
  origenId: number;
  destinoId: number;
  fechaHoraSalida: string;
  fechaHoraLlegada: string;
  precio: number;
  paradas?: AltaParadaDto[];
  confirm: boolean;
}

export interface FiltroBusquedaViajeDto {
  idLocalidadOrigen: number;
  idLocalidadDestino: number;    
  fechaViaje: string | Date;
  cantidadPasajes: number;
}
