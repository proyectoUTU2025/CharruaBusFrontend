import { TipoDepartamento } from "./tipo-departamento.enum";

export interface LocalidadDto {
  id: number;
  nombre: string;
  departamento: TipoDepartamento;
  codigo: string;
}

export interface AltaLocalidadDto {
  nombre: string;
  departamento: TipoDepartamento;
}

export interface FiltroBusquedaLocalidadDto {
  nombre?: string;
  departamento?: TipoDepartamento;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
