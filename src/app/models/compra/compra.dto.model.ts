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