import { Injectable } from '@angular/core';
import { Bus } from '../models/bus';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BusService {
  private _buses = new BehaviorSubject<Bus[]>([
    { id: 1, matricula: 'ABC-123', localidad: 'Montevideo', cantidadAsientos: 45, estado: true },
    { id: 2, matricula: 'XYZ-789', localidad: 'Punta del Este', cantidadAsientos: 52, estado: true },
    { id: 3, matricula: 'DEF-456', localidad: 'Colonia', cantidadAsientos: 48, estado: true },
    { id: 4, matricula: 'GHI-789', localidad: 'Paysandú', cantidadAsientos: 42, estado: true },
    { id: 5, matricula: 'JKL-012', localidad: 'Salto', cantidadAsientos: 50, estado: false },
    { id: 6, matricula: 'MNO-345', localidad: 'San José', cantidadAsientos: 55, estado: true },
    { id: 7, matricula: 'PQR-678', localidad: 'Durazno', cantidadAsientos: 40, estado: true }
  ]);

  getAll(): Observable<Bus[]> {
    return this._buses.asObservable();
  }

  create(b: Bus): Observable<Bus> {
    const current = this._buses.value;
    const newId = current.length ? Math.max(...current.map(x => x.id)) + 1 : 1;
    const newBus = { ...b, id: newId };
    this._buses.next([...current, newBus]);
    return new Observable<Bus>(obs => { obs.next(newBus); obs.complete(); });
  }

  update(b: Bus): Observable<Bus> {
    const updated = this._buses.value.map(x => x.id === b.id ? { ...x, ...b } : x);
    this._buses.next(updated);
    return new Observable<Bus>(obs => { obs.next(b); obs.complete(); });
  }

  delete(id: number): Observable<number> {
    this._buses.next(this._buses.value.filter(x => x.id !== id));
    return new Observable<number>(obs => { obs.next(id); obs.complete(); });
  }
}
