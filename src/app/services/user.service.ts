import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from '../models/users';

@Injectable({ providedIn: 'root' })
export class UserService {
  private _users = new BehaviorSubject<User[]>([
    { id: 1, nombre: 'Carlos Rodríguez', correo: 'carlos@charruabus.com', documento: '4.123.456-7', fechaNacimiento: '1980-03-15', fechaRegistro: '2022-03-15', ultimoAcceso: 'Hoy, 09:45', rol: 'Administrador', genero: 'Masculino', activo: true },
    { id: 2, nombre: 'María González', correo: 'maria@charruabus.com', documento: '3.987.654-1', fechaNacimiento: '1992-05-22', fechaRegistro: '2022-05-22', ultimoAcceso: 'Ayer, 17:30', rol: 'Vendedor', genero: 'Femenino', activo: true },
    { id: 3, nombre: 'Juan Pérez', correo: 'juan@gmail.com', documento: '5.678.901-2', fechaNacimiento: '1985-01-10', fechaRegistro: '2023-01-10', ultimoAcceso: 'Hace 3 días', rol: 'Cliente', genero: 'Masculino', activo: true },
    { id: 4, nombre: 'Ana Silva', correo: 'ana@hotmail.com', documento: '2.345.678-9', fechaNacimiento: '1990-04-05', fechaRegistro: '2023-04-05', ultimoAcceso: 'Hace 1 semana', rol: 'Cliente', genero: 'Femenino', activo: true },
    { id: 5, nombre: 'Roberto Fernández', correo: 'roberto@outlook.com', documento: '1.234.567-8', fechaNacimiento: '1978-06-18', fechaRegistro: '2023-06-18', ultimoAcceso: 'Hace 2 semanas', rol: 'Cliente', genero: 'Masculino', activo: false },
    { id: 6, nombre: 'Lucía Martínez', correo: 'lucia@mail.com', documento: '6.543.210-3', fechaNacimiento: '1995-09-30', fechaRegistro: '2023-09-30', ultimoAcceso: 'Hace 3 semanas', rol: 'Vendedor', genero: 'Femenino', activo: true }
  ]);

  getAll(): Observable<User[]> {
    return this._users.asObservable();
  }

  create(user: User): Observable<User> {
    const current = this._users.getValue();
    const nextId = Math.max(...current.map(u => u.id)) + 1;
    const created = { ...user, id: nextId };
    this._users.next([...current, created]);
    return of(created);
  }

  update(user: User): Observable<User> {
    const updatedList = this._users.getValue().map(u => u.id === user.id ? user : u);
    this._users.next(updatedList);
    return of(user);
  }

  delete(id: number): Observable<number> {
    this._users.next(this._users.getValue().filter(u => u.id !== id));
    return of(id);
  }
}
