export interface User {
  id: number;
  nombre: string;
  correo: string;
  documento: string;
  fechaNacimiento: string; // ISO string
  fechaRegistro?: string;
  ultimoAcceso?: string;
  rol: 'Administrador' | 'Vendedor' | 'Cliente';
  genero: 'Masculino' | 'Femenino' | 'Otro';
  activo: boolean;
}