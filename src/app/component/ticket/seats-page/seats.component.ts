import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { MaterialModule } from '../../../shared/material.module';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface Seat {
  seatLabel?: string;
  seatNo?: string;
  price?: number;
  status: 'available' | 'booked' | 'unavailable';
}

@Component({
  selector: 'app-seats',
  standalone: true,
  imports: [SharedModule, MaterialModule],
  templateUrl: './seats.component.html',
  styleUrls: ['./seats.component.scss']
})
export class SeatsComponent implements OnInit {
  seats: Seat[][] = [];
  cart = {
    selectedSeats: [] as string[],
    selectedIds: [] as number[],
    totalamount: 0
  };

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {
    this.http.get<number[]>('http://localhost:8080/api/seats/booked')
      .subscribe(bookedIds => this.buildChart(bookedIds));
  }

  private buildChart(booked: number[]) {
    this.seats = [];
    let n = 1;
    while (n <= 50) {
      const row: Seat[] = [];
      for (let i = 0; i < 2; i++) {
        row.push(this.makeSeat(n++, booked));
      }
      row.push({ status: 'unavailable' });
      for (let i = 0; i < 2; i++) {
        row.push(this.makeSeat(n++, booked));
      }
      this.seats.push(row);
    }
  }

  private makeSeat(n: number, booked: number[]): Seat {
    if (n > 50) return { status: 'unavailable' };
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
    seat.status = 'booked';
    this.cart.selectedSeats.push(seat.seatLabel!);
    this.cart.selectedIds.push(id);
    this.cart.totalamount += seat.price!;
  }

  processBooking() {
    this.http
      .post('http://localhost:8080/api/seats/purchase', this.cart.selectedIds)
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }
}
