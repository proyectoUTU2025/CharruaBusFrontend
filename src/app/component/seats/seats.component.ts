import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

export interface Seat {
  numero: number;
  estado: 'disponible' | 'ocupado' | 'seleccionado';
}

export interface SeatRow {
  numero: string;
  asientos: (Seat | null)[];
}

@Component({
  selector: 'app-seats',
  templateUrl: './seats.component.html',
  styleUrls: ['./seats.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class SeatsComponent implements OnChanges {
  @Input() totalAsientos: number = 40;
  @Input() asientosOcupados: number[] = [];
  @Input() asientosSeleccionados: number[] = [];
  @Input() maxSeleccion: number = 1;
  @Output() seleccionCambio = new EventEmitter<number[]>();

  filas: SeatRow[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalAsientos'] || changes['asientosOcupados'] || changes['asientosSeleccionados']) {
      this.generarMapaAsientos();
    }
  }

  generarMapaAsientos(): void {
    const allSeats: Seat[] = Array.from({ length: this.totalAsientos }, (_, i) => {
      const numero = i + 1;
      let estado: 'disponible' | 'ocupado' | 'seleccionado' = 'disponible';
      if (this.asientosOcupados.includes(numero)) {
        estado = 'ocupado';
      } else if (this.asientosSeleccionados.includes(numero)) {
        estado = 'seleccionado';
      }
      return { numero, estado };
    });

    const numRows = Math.ceil(this.totalAsientos / 4);
    this.filas = [];

    for (let i = 0; i < numRows; i++) {
      const asientosFila: (Seat | null)[] = [];
      for (let j = 0; j < 4; j++) {
        const seatIndex = i * 4 + j;
        if (seatIndex < this.totalAsientos) {
          asientosFila.push(allSeats[seatIndex]);
        } else {
          asientosFila.push(null);
        }
      }
      this.filas.push({
        numero: `${i + 1}`,
        asientos: asientosFila,
      });
    }
  }
  
  esDisponible(asiento: Seat | null): boolean {
    return asiento?.estado === 'disponible';
  }

  esOcupado(asiento: Seat | null): boolean {
    return asiento?.estado === 'ocupado';
  }

  esSeleccionado(asiento: Seat | null): boolean {
    return asiento?.estado === 'seleccionado';
  }

  getSeatIcon(asiento: Seat | null): string {
    if (this.esSeleccionado(asiento)) {
      return 'check_circle';
    }
    return 'event_seat';
  }

  toggleSeat(asiento: Seat | null): void {
    if (asiento && asiento.estado !== 'ocupado') {
      const index = this.asientosSeleccionados.indexOf(asiento.numero);
      if (index > -1) {
        // Deseleccionar
        this.asientosSeleccionados.splice(index, 1);
        asiento.estado = 'disponible';
      } else {
        // Seleccionar
        if (this.asientosSeleccionados.length < this.maxSeleccion) {
          this.asientosSeleccionados.push(asiento.numero);
          asiento.estado = 'seleccionado';
        } else {
          console.warn(`No se pueden seleccionar más de ${this.maxSeleccion} asientos.`);
        }
      }
      this.seleccionCambio.emit(this.asientosSeleccionados);
      // No es necesario regenerar todo el mapa, solo cambiar el estado visual
      // this.generarMapaAsientos(); 
    }
  }

  confirmSelection(): void {
    // La lógica de confirmación ahora se maneja en la página de compra.
    // Este componente solo emite los cambios.
    console.log('Asientos confirmados:', this.asientosSeleccionados);
  }
}
