import { TipoEstadoPasaje } from './tipo-estado-pasaje.enum';

export interface PasajeDto {
    id: number;
    compraId: number;
    fecha: string;
    numeroAsiento: number;
    paradaOrigen: string;
    paradaDestino: string;
    precio: number;
    descuento?: number;
    subtotal: number;
    montoReintegrado?: number;
    estadoPasaje: TipoEstadoPasaje;
}
