// src/app/models/usuario.dto.ts
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
  fechaNacimiento: string; // formato ISO 8601 (YYYY-MM-DD)
  activo: boolean;
}

// para el alta de usuario
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

// para la búsqueda y filtrado
export interface FiltroBusquedaUsuarioDto {
  nombre?: string;
  apellido?: string;
  documento?: string;
  email?: string;
  roles?: TipoRol[];
  activo?: boolean;
}

// para paginación y ordenamiento
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;   
}
