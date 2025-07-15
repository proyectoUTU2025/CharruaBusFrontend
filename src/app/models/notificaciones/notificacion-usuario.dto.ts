export interface NotificacionUsuarioDto {
  id: number;
  clienteId: number;
  compraId: number;
  titulo: string;
  mensaje: string;
  fecha: Date;
  leido: boolean;
} 