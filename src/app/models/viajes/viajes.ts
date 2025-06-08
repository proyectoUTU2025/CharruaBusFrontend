export interface Viaje {
  id: number;
  fechaSalida: string;
  fechaLlegada: string;
  horaSalida: string;
  horaLlegada: string;
  origen: string;
  destino: string;
  precio: number;
  pasajesVendibles: number;
  tipo: string;
  venta: string;
}
