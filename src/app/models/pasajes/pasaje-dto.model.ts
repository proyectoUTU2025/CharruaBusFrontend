import { TipoEstadoPasaje } from './tipo-estado-pasaje.enum';

export interface PasajeDto {
    id: number;
    compraId: number;
    fecha: string; 
    fechaLlegada?: string;
    fechaCompra: string;
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
