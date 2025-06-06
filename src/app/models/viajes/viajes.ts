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
  fechaHoraLlegada: string; 
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
  localidadOrigenId?: number | null;
  localidadDestinoId?: number | null;
  fechaDesde: string;
  fechaHasta: string;
}

  

