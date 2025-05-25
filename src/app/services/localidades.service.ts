import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Localidad } from '../models/localidades';

@Injectable({ providedIn: 'root' })
export class LocalidadService {
  private _localidades = new BehaviorSubject<Localidad[]>([
    new Localidad(1, 'Montevideo', 'Centro', 'MT-001'),
    new Localidad(2, 'Canelones', 'Las Piedras', 'CA-002'),
    new Localidad(3, 'Rocha', 'La Paloma', 'RO-003'),
    new Localidad(4, 'Maldonado', 'Punta del Este', 'MA-004'),
    new Localidad(4, 'San Jose', 'San Jose de Mayo', 'SJ-007')
  ]);

  getAll(): Observable<Localidad[]> {
    return this._localidades.asObservable();
  }

  create(localidad: Localidad): Observable<Localidad> {
    const current = this._localidades.value;
    const newId = current.length ? Math.max(...current.map(l => l.id)) + 1 : 1;
    const newLoc = new Localidad(newId, localidad.departamento, localidad.nombre, localidad.codigo);
    this._localidades.next([...current, newLoc]);
    return new BehaviorSubject(newLoc).asObservable();
  }

  update(localidad: Localidad): Observable<Localidad> {
    const updated = this._localidades.value.map(l => l.id === localidad.id ? localidad : l);
    this._localidades.next(updated);
    return new BehaviorSubject(localidad).asObservable();
  }

  delete(id: number): Observable<number> {
    const filtered = this._localidades.value.filter(l => l.id !== id);
    this._localidades.next(filtered);
    return new BehaviorSubject(id).asObservable();
  }
}
