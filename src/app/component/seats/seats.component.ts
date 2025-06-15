import { ApiResponse } from './../../models/api/api-response.model';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '../../../environments/environment';
import { AsientoDto, DetalleViajeDto } from '../../models';


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
  styleUrls: ['./seats.component.scss']
})
export class SeatsComponent implements OnInit {
  @Input() cantidadAsientos!: number;
  @Input() viajeId!: number;
  @Input() maxSeleccion = 5;

  @Output() bookingConfirmed = new EventEmitter<number[]>();

  seats: Seat[][] = [];
  cart = {
    selectedIds: [] as number[],
    totalamount: 0
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get<ApiResponse<DetalleViajeDto>>(
        `${environment.apiBaseUrl}/viajes/${this.viajeId}`
      )
      .subscribe(response => this.buildChart(response.data.asientos || []));
  }

  private buildChart(asientos: AsientoDto[]) {
  const booked = asientos
    .filter(a => a.estado === 'RESERVADO' || a.estado === 'CONFIRMADO')
    .map(a => a.numero);

  const cols = 2;
  const perRow = cols * 2;
  const rows = Math.ceil(this.cantidadAsientos / perRow);
  let n = 1;
  this.seats = [];

  for (let r = 0; r < rows; r++) {
    const row: Seat[] = [];

    for (let i = 0; i < cols; i++) {
      row.push(n <= this.cantidadAsientos ? this.makeSeat(n++, booked) : { status: 'unavailable' });
    }
    row.push({ status: 'unavailable' }); // pasillo
    for (let i = 0; i < cols; i++) {
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
    const id = parseInt(seat.seatNo!, 10);
    const idx = this.cart.selectedIds.indexOf(id);

    if (idx > -1) {
      // des-seleccionar
      this.cart.selectedIds.splice(idx, 1);
      seat.status = 'available';
    } else if (this.cart.selectedIds.length < this.maxSeleccion) {
      this.cart.selectedIds.push(id);
      seat.status = 'booked';
    }

    this.cart.totalamount = this.cart.selectedIds.length * 250;
    
    this.bookingConfirmed.emit(this.cart.selectedIds);
  } 
}
