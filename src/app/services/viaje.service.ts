import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Viaje } from '../models/viajes';

@Injectable({ providedIn: 'root' })
export class ViajeService {
  private _viajes = new BehaviorSubject<Viaje[]>([
    {
      id: 1,
      fechaSalida: '15/06/2023',
      fechaLlegada: '15/06/2023',
      horaSalida: '08:00',
      horaLlegada: '12:30',
      origen: 'Montevideo',
      destino: 'Punta del Este',
      precio: 1200,
      asientos: 45,
      tipo: 'Regular',
      venta: 'Disponible'
    },
    {
      id: 2,
      fechaSalida: '16/06/2023',
      fechaLlegada: '16/06/2023',
      horaSalida: '09:00',
      horaLlegada: '14:00',
      origen: 'Montevideo',
      destino: 'Colonia',
      precio: 950,
      asientos: 40,
      tipo: 'Regular',
      venta: 'Disponible'
    },
    {
      id: 3,
      fechaSalida: '17/06/2023',
      fechaLlegada: '17/06/2023',
      horaSalida: '07:30',
      horaLlegada: '13:00',
      origen: 'Punta del Este',
      destino: 'Montevideo',
      precio: 1200,
      asientos: 45,
      tipo: 'Regular',
      venta: 'No disponible'
    }
  ]);

  getAll(): Observable<Viaje[]> {
    return this._viajes.asObservable();
  }

  addViaje(viaje: Viaje): void {
    const viajes = this._viajes.value;
    const nuevo = { ...viaje, id: viajes.length + 1 };
    this._viajes.next([...viajes, nuevo]);
  }
}
