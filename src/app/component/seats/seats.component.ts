import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';

interface Seat {
  seatLabel?: string;
  seatNo?: string;
  price?: number;
  status: 'available' | 'booked' | 'unavailable';
}

@Component({
  selector: 'app-seats',
  standalone: true,
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './seats.component.html',
  styleUrls: ['./seats.component.css']
})
export class SeatsComponent implements OnInit {
  @Input() cantidadAsientos!: number;
  @Input() viajeId!: number;
  @Input() clienteId!: number;
  @Input() origenId!: number;
  @Input() destinoId!: number;

  @Output() bookingConfirmed = new EventEmitter<number[]>();

  seats: Seat[][] = [];
  maxSeleccion = 5;

  cart = {
    selectedSeats: [] as string[],
    selectedIds: [] as number[],
    totalamount: 0
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<number[]>(`/api/seats/booked/${this.viajeId}`)
      .subscribe(booked => this.buildChart(booked));
  }

  buildChart(booked: number[]) {
    const columnasPorLado = 2;
    const porFila = columnasPorLado * 2;
    const filas = Math.ceil(this.cantidadAsientos / porFila);

    this.seats = [];
    let n = 1;

    for (let r = 0; r < filas; r++) {
      const row: Seat[] = [];

      for (let i = 0; i < columnasPorLado; i++) {
        row.push(n <= this.cantidadAsientos ? this.makeSeat(n++, booked) : { status: 'unavailable' });
      }

      row.push({ status: 'unavailable' });

      for (let i = 0; i < columnasPorLado; i++) {
        row.push(n <= this.cantidadAsientos ? this.makeSeat(n++, booked) : { status: 'unavailable' });
      }

      this.seats.push(row);
    }
  }

  private makeSeat(n: number, booked: number[]): Seat {
    return {
      seatLabel: 'S' + n,
      seatNo: n < 10 ? '0' + n : '' + n,
      price: 250,
      status: booked.includes(n) ? 'booked' : 'available'
    };
  }

  selectSeat(seat: Seat) {
    if (seat.status !== 'available') return;
    if (this.cart.selectedIds.length >= this.maxSeleccion) return;

    const id = parseInt(seat.seatNo!, 10);
    seat.status = 'booked';
    this.cart.selectedSeats.push(seat.seatLabel!);
    this.cart.selectedIds.push(id);
    this.cart.totalamount += seat.price!;
  }

  processBooking() {
    if (this.cart.selectedIds.length > 0) {
      this.bookingConfirmed.emit(this.cart.selectedIds);
    }
  }
}
