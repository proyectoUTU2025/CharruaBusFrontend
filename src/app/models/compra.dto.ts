export interface CompraDto {
  id: number;
  fechaCompra: string;           
  precioActual: number;
  precioOriginal: number;
  vendedorId: number;
  clienteId: number;
  cantidadPasajes: number;
  estado: string;
}
