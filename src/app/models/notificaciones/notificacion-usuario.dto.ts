export interface NotificacionUsuarioDto {
  id: number;
  clienteId: number;
  titulo: string;
  mensaje: string;
  fecha: Date;
  leido: boolean;
} 