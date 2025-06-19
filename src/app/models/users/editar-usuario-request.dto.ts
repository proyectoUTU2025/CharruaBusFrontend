import { TipoCategoriaCliente } from "./tipo-categoria-cliente.enum";
import { TipoDocumento } from "./tipo-documento.enum";

export interface EditarUsuarioRequestDto {
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    tipoDocumento: TipoDocumento;
    documento: string;
    situacionLaboral?: TipoCategoriaCliente;
}
