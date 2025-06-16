import { TipoCategoriaCliente } from './tipo-categoria-cliente.enum';
import { TipoDocumento } from './tipo-documento.enum';
import { TipoRol } from './tipo-rol.enum';

export interface UsuarioDto {
  id: number;
  email: string;
  password: string; 
  nombre: string;
  apellido: string;
  documento: string;  
  tipoDocumento: TipoDocumento;
  rol: TipoRol;
  fechaNacimiento: string; 
  activo: boolean;
  situacionLaboral?: TipoCategoriaCliente; 
}

export interface AltaUsuarioDto {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  documento: string;
  tipoDocumento: TipoDocumento;
  rol: TipoRol;
  fechaNacimiento: string;
}

export interface FiltroBusquedaUsuarioDto {
  nombre?: string;
  apellido?: string;
  documento?: string;
  email?: string;
  roles?: TipoRol[];
  activo?: boolean;
}


