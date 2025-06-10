import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { CompraRequestDto } from '../../models/compra';
import { ViajeService } from '../../services/viaje.service';
import { CompraViajeDto, FiltroBusquedaViajeDto } from '../../models/viajes';
import { SeatsComponent } from '../seats/seats.component';
import { CompraService } from '../../services/compra.service';
import { LocalidadService } from '../../services/localidades.service';
import { PurchaseSummaryDialogComponent } from './dialogs/purchase-summary-dialog/purchase-summary-dialog.component';
import {SummaryDialogData } from './dialogs/purchase-summary-dialog/purchase-summary-dialog.component';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-compra-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatStepperModule,
    MatDialogModule,
    MatListModule,
    SeatsComponent,
    PurchaseSummaryDialogComponent,
    MatIconModule
  ],
  templateUrl: './compra-page.component.html',
  styleUrls: ['./compra-page.component.scss']
})
export class CompraPageComponent implements OnInit {
  searchForm!: FormGroup;
  localidades: any[] = [];
  destinos: any[] = [];
  viajes: CompraViajeDto[] = [];
  selectedSeats: number[] = [];

  constructor(
    private fb: FormBuilder,
    private localidadService: LocalidadService,
    private viajeService: ViajeService,
    private compraService: CompraService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      origen:    [null, Validators.required],
      destino:   [null, Validators.required],
      fechaIda:  [null, Validators.required],
      pasajeros: [1, [Validators.min(1), Validators.max(5)]]
    });
    this.localidadService.getAllFlat().subscribe(list => this.localidades = list);
    this.searchForm.get('origen')!.valueChanges.subscribe(id =>
      this.localidadService.getDestinos(id).subscribe(d => this.destinos = d)
    );
  }

  buscar(): void {
    const f = this.searchForm.value as FiltroBusquedaViajeDto;
    this.viajeService.buscarParaCompra(f).then(page => this.viajes = page.content);
  }

  openSeatDialog(v: CompraViajeDto): void {
    this.selectedSeats = [];
  }

  openPurchase(): void {
    const dialogRef = this.dialog.open<PurchaseSummaryDialogComponent, SummaryDialogData, boolean>(
      PurchaseSummaryDialogComponent,
      {
        width: '400px',
        data: { seats: this.selectedSeats, total: this.selectedSeats.length * 250 }
      }
    );
    dialogRef.afterClosed().subscribe(ok => { if (ok) this.confirmarCompra(); });
  }

  confirmarCompra(): void {
    const f = this.searchForm.value;
    const dto: CompraRequestDto = {
      viajeIdaId: this.viajes[0].id,
      viajeVueltaId: null,
      asientosIda: this.selectedSeats,
      asientosVuelta: undefined,
      clienteId: 1,
      localidadOrigenId: f.origen,
      localidadDestinoId: f.destino,
      paradaOrigenVueltaId: null,
      paradaDestinoVueltaId: null
    };
    this.compraService.iniciarCompra(dto).subscribe(res => window.location.href = res.data.sessionUrl);
  }
}
