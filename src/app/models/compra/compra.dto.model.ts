export interface CompraRequestDto {
  viajeIdaId: number;
  viajeVueltaId?: number | null;
  asientosIda: number[];
  asientosVuelta?: number[] | null;
  clienteId: number;
  localidadOrigenId: number;
  localidadDestinoId: number;
  paradaOrigenVueltaId?: number | null;
  paradaDestinoVueltaId?: number | null;
}

export interface CompraResponseDto {
  compraId: number;
  sessionUrl: string;
  sessionId: string;
}

export interface CompraDto {
  id: number;
  fechaCompra: string;
  precioActual: number;
  precioOriginal: number;
  vendedorId?: number;
  clienteId: number;
  cantidadPasajes: number;
  estado: string;
}

export interface DetalleCompraDto {
  id: number;
  fechaCompra: string;
  precioActual: number;
  precioOriginal: number;
  vendedorId?: number;
  clienteId: number;
  cantidadPasajes: number;
  estado: string;
  pasajes: PasajeDto[];
}

export interface PasajeDto {
  id: number;
  compraId: number;
  fecha: string;
  numeroAsiento: number;
  paradaOrigen: string;
  paradaDestino: string;
  precio: number;
  descuento: number;
  subtotal: number;
  estadoPasaje: string;
}

export interface FiltroBusquedaCompraDto {
  estados?: string[];
  fechaDesde?: string;
  fechaHasta?: string;
  montoMin?: number;
  montoMax?: number;
}
