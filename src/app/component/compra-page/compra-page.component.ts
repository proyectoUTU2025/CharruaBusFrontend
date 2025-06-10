import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { CompraRequestDto } from '../../models/compra';
import { SeatsComponent } from '../seats/seats.component';
import { SummaryDialogData } from './dialogs/purchase-summary-dialog/purchase-summary-dialog.component';
import { CompraService } from '../../services/compra.service';
import { PurchaseSummaryDialogComponent } from './dialogs/purchase-summary-dialog/purchase-summary-dialog.component';

@Component({
  selector: 'app-compra-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatStepperModule,
    MatDialogModule,
    MatListModule,
    SeatsComponent,
    PurchaseSummaryDialogComponent
  ],
  templateUrl: './compra-page.component.html',
  styleUrls: ['./compra-page.component.scss']
})
export class CompraPageComponent implements OnInit {
  searchForm!: FormGroup;
  viajes: any[] = [];
  selectedSeats: number[] = [];

  constructor(
    private fb: FormBuilder,
    private compraService: CompraService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      origen: [null, Validators.required],
      destino: [null, Validators.required],
      fechaIda: [null, Validators.required],
      pasajeros: [1, [Validators.min(1), Validators.max(5)]]
    });
  }

  buscar(): void {
    // implementar llamada real
    this.viajes = [];
  }

  openSeatDialog(): void {
    // ejemplo: seleccionas seats aquí
    this.selectedSeats = [1, 2];
  }

  openPurchase(): void {
    const dialogRef = this.dialog.open<PurchaseSummaryDialogComponent, SummaryDialogData, boolean>(
      PurchaseSummaryDialogComponent,
      {
        width: '400px',
        data: {
          seats: this.selectedSeats,
          total: this.selectedSeats.length * 250
        }
      }
    );
    dialogRef.afterClosed().subscribe(ok => {
      if (ok) this.confirmarCompra();
    });
  }

  confirmarCompra(): void {
    const dto: CompraRequestDto = {
      viajeIdaId: 1,
      viajeVueltaId: null,
      asientosIda: this.selectedSeats,
      asientosVuelta: undefined,
      clienteId: 1,
      localidadOrigenId: 1,
      localidadDestinoId: 2,
      paradaOrigenVueltaId: null,
      paradaDestinoVueltaId: null
    };
    this.compraService.iniciarCompra(dto).subscribe(res => {
      window.location.href = res.data.sessionUrl;
    });
  }
}
