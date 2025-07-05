import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

export interface Seat {
  numero: number;
  estado?: 'disponible' | 'ocupado' | 'seleccionado';
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
export class SeatsComponent implements OnInit, OnChanges {
  @Input() totalAsientos: number = 40;
  @Input() asientosOcupados: number[] = [];
  @Input() asientosSeleccionados: number[] = [];
  @Input() maxSeleccion: number = 1;
  @Input() showConfirmButton: boolean = false;
  
  @Output() asientosChange = new EventEmitter<number[]>();
  @Output() onConfirm = new EventEmitter<number[]>();

  seats: Seat[] = [];
  seatRows: { izquierda: Seat[]; derecha: Seat[] }[] = [];
  selectedSeats: number[] = [];

  ngOnInit(): void {
    this.selectedSeats = [...this.asientosSeleccionados];
    this.initializeSeats();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalAsientos'] || changes['asientosOcupados']) {
      this.initializeSeats();
    }
  }

  private initializeSeats(): void {
    this.seats = [];
    for (let i = 1; i <= this.totalAsientos; i++) {
      this.seats.push({
        numero: i,
        estado: this.getInitialSeatState(i)
      });
    }
    this.buildSeatRows();
  }

  private buildSeatRows(): void {
    this.seatRows = [];
    for (let i = 0; i < this.seats.length; i += 4) {
      const izquierda = this.seats.slice(i, i + 2);
      const derecha = this.seats.slice(i + 2, i + 4);
      this.seatRows.push({ izquierda, derecha });
    }
  }

  private getInitialSeatState(seatNumber: number): 'disponible' | 'ocupado' | 'seleccionado' {
    if (this.asientosOcupados.includes(seatNumber)) {
      return 'ocupado';
    }
    if (this.selectedSeats.includes(seatNumber)) {
      return 'seleccionado';
    }
    return 'disponible';
  }

  getSeatClass(seat: Seat): string {
    if (seat.estado === 'ocupado') return 'confirmado';
    if (this.selectedSeats.includes(seat.numero)) return 'reservado';
    return 'disponible';
  }

  onSeatClick(seat: Seat): void {
    if (seat.estado === 'ocupado') return;

    const idx = this.selectedSeats.indexOf(seat.numero);
    if (idx > -1) {
      this.selectedSeats.splice(idx, 1);
    } else if (this.selectedSeats.length < this.maxSeleccion) {
      this.selectedSeats.push(seat.numero);
    }
    this.asientosChange.emit(this.selectedSeats);
    this.buildSeatRows();
  }

  confirmSelection(): void {
    this.onConfirm.emit(this.selectedSeats);
  }
}
