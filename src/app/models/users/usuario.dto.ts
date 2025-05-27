// src/app/models/usuario.dto.ts
import { TipoDocumento } from './tipo-documento.enum';
import { TipoRol } from './tipo-rol.enum';

export interface UsuarioDto {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  documento: string;
  tipoDocumento: TipoDocumento;
  rol: TipoRol;
  fechaNacimiento: string; // ISO date string
  activo: boolean;
}

// para el alta
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

// para los filtros
export interface FiltroBusquedaUsuarioDto {
  nombre?: string;
  apellido?: string;
  documento?: string;
  email?: string;
  roles?: TipoRol[];
  activo?: boolean;
}

// genérico para paginación Spring Data
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // página actual (0-based)
}
