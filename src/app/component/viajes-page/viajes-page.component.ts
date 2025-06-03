import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ViajeService } from '../../services/viaje.service';
import { FiltroBusquedaViajeDto, ViajeDisponibleDto } from '../../models/viajes';

@Component({
  selector: 'app-viajes-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './viajes-page.component.html',
  styleUrls: ['./viajes-page.component.scss']
})
export class ViajesPageComponent implements OnInit {
  columns = ['idViaje', 'fechaHoraSalida', 'fechaHoraLlegada', 'origen', 'destino', 'precioEstimado', 'asientosDisponibles'];
  dataSource: ViajeDisponibleDto[] = [];
  filtro: FiltroBusquedaViajeDto = {
    idLocalidadOrigen: 0,
    idLocalidadDestino: 0,
    fechaViaje: '',
    cantidadPasajes: 1
  };

  constructor(private viajeService: ViajeService) {}

  ngOnInit(): void {
    this.buscar();
  }

  buscar(): void {
    if (!this.filtro.fechaViaje) return;

    const filtroTransformado: FiltroBusquedaViajeDto = {
      ...this.filtro,
      fechaViaje: typeof this.filtro.fechaViaje === 'string'
        ? this.filtro.fechaViaje
        : this.filtro.fechaViaje.toISOString().split('T')[0]
    };

    this.viajeService.buscar(filtroTransformado).then((res: ViajeDisponibleDto[]) => {
      this.dataSource = res;
    });
  }

  limpiarFiltros(): void {
    this.filtro = {
      idLocalidadOrigen: 0,
      idLocalidadDestino: 0,
      fechaViaje: '',
      cantidadPasajes: 1
    };
    this.dataSource = [];
  }
}
