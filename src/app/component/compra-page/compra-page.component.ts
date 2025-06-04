import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CompraRequestDto } from '../../models/compra';
import { SeatsComponent } from '../seats/seats.component';
import { CompraService } from '../../services/compra.service.service';

@Component({
  selector: 'app-compra-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, SeatsComponent],
  templateUrl: './compra-page.component.html',
  styleUrls: ['./compra-page.component.scss']
})
export class CompraPageComponent implements OnInit {
  viajeIdaId!: number;
  viajeVueltaId?: number;
  clienteId!: number;
  localidadOrigenId!: number;
  localidadDestinoId!: number;
  paradaOrigenVueltaId?: number;
  paradaDestinoVueltaId?: number;
  capacidad!: number;

  asientosIda: number[] = [];
  asientosVuelta: number[] = [];

  paso = 1;

  constructor(
    private route: ActivatedRoute,
    private compraService: CompraService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const state = history.state;

    this.viajeIdaId = state.viajeIdaId;
    this.viajeVueltaId = state.viajeVueltaId;
    this.clienteId = state.clienteId;
    this.localidadOrigenId = state.localidadOrigenId;
    this.localidadDestinoId = state.localidadDestinoId;
    this.paradaOrigenVueltaId = state.paradaOrigenVueltaId;
    this.paradaDestinoVueltaId = state.paradaDestinoVueltaId;
    this.capacidad = state.capacidad;
  }

  onAsientosSeleccionados(asientos: number[]): void {
    if (this.paso === 1) {
      this.asientosIda = asientos;
      if (this.viajeVueltaId) {
        this.paso = 2;
      } else {
        this.confirmarCompra();
      }
    } else if (this.paso === 2) {
      this.asientosVuelta = asientos;
      this.confirmarCompra();
    }
  }

  confirmarCompra(): void {
    const dto: CompraRequestDto = {
      viajeIdaId: this.viajeIdaId,
      viajeVueltaId: this.viajeVueltaId,
      asientosIda: this.asientosIda,
      asientosVuelta: this.viajeVueltaId ? this.asientosVuelta : undefined,
      clienteId: this.clienteId,
      localidadOrigenId: this.localidadOrigenId,
      localidadDestinoId: this.localidadDestinoId,
      paradaOrigenVueltaId: this.paradaOrigenVueltaId,
      paradaDestinoVueltaId: this.paradaDestinoVueltaId
    };

    this.compraService.iniciarCompra(dto).subscribe({
      next: (res) => window.location.href = res.data.sessionUrl,
      error: () => alert('Error al iniciar la compra. Intente nuevamente.')
    });
  }
}
