import { TipoEstadoPasaje } from './tipo-estado-pasaje.enum';

export interface PasajeDto {
    id: number;
    compraId: number;
    fecha: string; // Fecha en que el bus llega a la parada donde se sube el usuario
    fechaLlegada?: string; // Fecha en que el bus llega a la parada de destino
    fechaCompra: string; // Fecha en que se realizó la compra del pasaje
    numeroAsiento: number;
    paradaOrigen: string;
    paradaDestino: string;
    precio: number;
    descuento?: number;
    subtotal: number;
    estadoPasaje: TipoEstadoPasaje;
    fechaDevolucion?: string;
    montoReintegrado?: number;
    fueReembolsado: boolean;
}
