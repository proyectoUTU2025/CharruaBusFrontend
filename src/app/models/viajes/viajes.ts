export interface ViajeDisponibleDto {
  idViaje: number;
  nombreLocalidadOrigen: string;
  nombreLocalidadDestino: string;
  fechaHoraSalida: string;
  fechaHoraLlegada: string;
  asientosDisponibles: number;
  precioPorTramo: number;
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
  fechaHasta?: string;
}

  export interface CompraViajeDto {
  idViaje: number;
  origen: string;
  destino: string;
  fechaHoraSalida: string;
  fechaHoraLlegada: string;
  precioEstimado: number; 
  asientosDisponibles: number;
}
export interface DetalleViajeDto {
  id: number;
  omnibusId: number;
  omnibusMatricula: string;
  fechaHoraSalida: string; 
  fechaHoraLlegada: string;
  precio: number;
  cantidadPasajesVendibles: number;
  cantidadAsientosVendidos: number;
  cantidadAsientosDisponibles: number;
  cantidadAsientosReservados: number;
  ventaDisponible: boolean;
  precioPorTramo: number;
  paradas: ParadaProgramadaDto[];
  asientos: AsientoDto[];
}

export interface ParadaProgramadaDto {
  localidadId: number;
  nombreLocalidad: string;
  horaProgramada: string; 
  orden: number;
}

export interface AsientoDto {
  id: number;
  numero: number;
  estado: string;
}

