import { Component, OnInit, AfterViewChecked } from '@angular/core';
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
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { CompraRequestDto } from '../../models/compra';
import { ViajeService } from '../../services/viaje.service';
import { CompraViajeDto } from '../../models/viajes';
import { SeatsComponent } from '../seats/seats.component';
import { CompraService } from '../../services/compra.service';
import { PurchaseSummaryDialogComponent, SummaryDialogData } from './dialogs/purchase-summary-dialog/purchase-summary-dialog.component';
import { LocalidadService } from '../../services/localidades.service';

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
    MatIconModule,
    MatTabsModule,
    SeatsComponent,
    PurchaseSummaryDialogComponent
  ],
  templateUrl: './compra-page.component.html',
  styleUrls: ['./compra-page.component.scss']
})
export class CompraPageComponent implements OnInit, AfterViewChecked {
  step = 0;
  completedSteps: boolean[] = [false, false, false, false, false, false];
  tipoViaje: 'IDA' | 'IDA_Y_VUELTA' = 'IDA';
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
      localidadOrigenId:  [null, Validators.required],
      localidadDestinoId: [null, Validators.required],
      fechaDesde:         [null, Validators.required],
      fechaVuelta:        [null],
      pasajeros:          [1, [Validators.min(1), Validators.max(5)]]
    });

    this.localidadService.getLocalidadesOrigenValidas()
      .subscribe(list => this.localidades = list);

    this.searchForm.get('localidadOrigenId')!.valueChanges.subscribe(id => {
      this.localidadService.getDestinosPosibles(id).subscribe(d => this.destinos = d);
    });
  }

  cambiarTipoViaje(index: number) {
    this.tipoViaje = index === 0 ? 'IDA' : 'IDA_Y_VUELTA';
    this.searchForm.get('fechaVuelta')?.reset();
  }

  buscar(): void {
    const f = this.searchForm.value;
    const filtro = {
      idLocalidadOrigen: f.localidadOrigenId,
      idLocalidadDestino: f.localidadDestinoId,
      fechaViaje: f.fechaDesde,
      cantidadPasajes: f.pasajeros
    };
    this.viajeService.buscarDisponibles(filtro).then(page => {
      this.viajes = page.content;
      this.siguientePaso();
    });
  }

  limpiarFiltros(): void {
    this.searchForm.reset({ pasajeros: 1 });
    this.destinos = this.localidades;
    this.viajes = [];
    this.step = 0;
    this.completedSteps = [false, false, false, false, false, false];
  }

  openSeatDialog(v: CompraViajeDto): void {
    this.selectedSeats = [];
    this.siguientePaso();
  }

  openPurchase(): void {
    const dialogRef = this.dialog.open<PurchaseSummaryDialogComponent, SummaryDialogData, boolean>(
      PurchaseSummaryDialogComponent,
      {
        width: '400px',
        data: { seats: this.selectedSeats, total: this.selectedSeats.length * 250 }
      }
    );
    dialogRef.afterClosed().subscribe(ok => {
      if (ok) {
        this.siguientePaso();
        this.confirmarCompra();
      }
    });
  }

  confirmarCompra(): void {
    const f = this.searchForm.value;
    const dto: CompraRequestDto = {
      viajeIdaId:           this.viajes[0].id,
      viajeVueltaId:        null,
      asientosIda:          this.selectedSeats,
      asientosVuelta:       undefined,
      clienteId:            1,
      localidadOrigenId:    f.localidadOrigenId,
      localidadDestinoId:   f.localidadDestinoId,
      paradaOrigenVueltaId: null,
      paradaDestinoVueltaId:null
    };
    this.compraService.iniciarCompra(dto).subscribe(res => window.location.href = res.data.sessionUrl);
  }

  siguientePaso(): void {
    if (this.step < this.completedSteps.length) {
      this.completedSteps[this.step] = true;
      this.step++;
    }
  }

  anteriorPaso(): void {
    if (this.step > 0) {
      this.step--;
    }
  }

  ngAfterViewChecked(): void {
    const headers = document.querySelectorAll('.mat-horizontal-stepper-header');
    headers.forEach((header, index) => {
      const icon = header.querySelector('.mat-step-icon') as HTMLElement;
      const label = header.querySelector('.mat-step-label') as HTMLElement;
      if (index < this.step) {
        icon.style.backgroundColor = '#3e5f3c';
        label.style.color = '#3e5f3c';
      } else if (index === this.step) {
        icon.style.backgroundColor = '#675992';
        label.style.color = '#675992';
      } else {
        icon.style.backgroundColor = '#ccc';
        label.style.color = '#444';
      }
    });
  }
}
