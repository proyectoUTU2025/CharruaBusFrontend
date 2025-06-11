import { Component, OnInit, AfterViewChecked, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CompraRequestDto } from '../../models/compra';
import { ViajeService } from '../../services/viaje.service';
import { CompraViajeDto } from '../../models/viajes';
import { SeatsComponent } from '../seats/seats.component';
import { PurchaseSummaryDialogComponent, SummaryDialogData } from './dialogs/purchase-summary-dialog/purchase-summary-dialog.component';
import { LocalidadService } from '../../services/localidades.service';
import { CompraService } from '../../services/compra.service';
import { SelectSeatsDialogComponent } from './dialogs/select-seats-dialog/select-seats-dialog.component';

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
    MatPaginatorModule,
    SeatsComponent,
    PurchaseSummaryDialogComponent
  ],
  templateUrl: './compra-page.component.html',
  styleUrls: ['./compra-page.component.scss']
})
export class CompraPageComponent implements OnInit, AfterViewChecked {
  step = 0;
  completedSteps: boolean[] = [false, false, false, false, false];
  tipoViaje: 'IDA' | 'IDA_Y_VUELTA' = 'IDA';
  selectedTabIndex = 0;
  searchForm!: FormGroup;
  pasajerosForm!: FormGroup;
  localidades: any[] = [];
  destinos: any[] = [];
  viajes: CompraViajeDto[] = [];
  selectedSeats: number[] = [];
  viajeSeleccionado: CompraViajeDto | null = null;

  totalElements = 0;
  pageSize = 5;
  pageIndex = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private localidadService: LocalidadService,
    private viajeService: ViajeService,
    private compraService: CompraService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      localidadOrigenId: [null, Validators.required],
      localidadDestinoId: [null, Validators.required],
      fechaDesde: [null, Validators.required],
      fechaVuelta: [null],
      pasajeros: [1, [Validators.min(1), Validators.max(5)]]
    });

    this.pasajerosForm = this.fb.group({
      pasajeros: this.fb.array([])
    });

    this.searchForm.get('pasajeros')!.valueChanges.subscribe(n => this.generarFormularioPasajeros(n));
    this.generarFormularioPasajeros(this.searchForm.value.pasajeros);

    this.localidadService.getLocalidadesOrigenValidas().subscribe(list => this.localidades = list);
    this.searchForm.get('localidadOrigenId')!.valueChanges.subscribe(id => {
      this.localidadService.getDestinosPosibles(id).subscribe(d => this.destinos = d);
    });
  }

  get pasajeros(): FormArray {
    return this.pasajerosForm.get('pasajeros') as FormArray;
  }

  private generarFormularioPasajeros(cantidad: number): void {
  const array = this.fb.array<FormGroup>([]); // Tipo explícito

  for (let i = 0; i < cantidad; i++) {
    const grupo = this.fb.group({
      nombre: ['', Validators.required],
      documento: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      direccion: ['', Validators.required]
    }) as FormGroup;

    array.push(grupo);
  }

  this.pasajerosForm.setControl('pasajeros', array);
}

  cambiarTipoViaje(index: number): void {
    this.tipoViaje = index === 0 ? 'IDA' : 'IDA_Y_VUELTA';
    this.selectedTabIndex = index;
    this.searchForm.get('fechaVuelta')?.reset();
  }

  buscar(): void {
    this.pageIndex = 0;
    this.buscarConPaginacion();
  }

  buscarConPaginacion(): void {
    const f = this.searchForm.value;
    const filtro = {
      idLocalidadOrigen: f.localidadOrigenId,
      idLocalidadDestino: f.localidadDestinoId,
      fechaViaje: this.formatFecha(f.fechaDesde),
      cantidadPasajes: f.pasajeros
    };

    this.viajeService.buscarDisponibles(filtro, this.pageIndex, this.pageSize)
      .then(page => {
        this.viajes = page.content;
        this.totalElements = page.totalElements;
        this.step = 1;
      });
  }

  cambiarPagina(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.buscarConPaginacion();
  }

  limpiarFiltros(): void {
    this.searchForm.reset({ pasajeros: 1 });
    this.destinos = this.localidades;
    this.viajes = [];
    this.step = 0;
    this.viajeSeleccionado = null;
    this.completedSteps = [false, false, false, false, false];
  }

  seleccionarViaje(v: CompraViajeDto): void {
    this.viajeSeleccionado = v;
  }

  abrirDialogPasajeros(): void {
    const pasajeros = this.searchForm.value.pasajeros;
    const dialogRef = this.dialog.open(SelectSeatsDialogComponent, {
      width: '600px',
      data: {
        pasajeros,
        viajeId: this.viajeSeleccionado?.id,
        cantidadAsientos: this.viajeSeleccionado?.asientosDisponibles
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedSeats = result.asientos;
        this.completedSteps[2] = true;
      }
    });
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
        this.step = 4;
        this.confirmarCompra();
      }
    });
  }

  confirmarCompra(): void {
    const f = this.searchForm.value;
    const dto: CompraRequestDto = {
      viajeIdaId: this.viajeSeleccionado?.id || 0,
      viajeVueltaId: null,
      asientosIda: this.selectedSeats,
      asientosVuelta: undefined,
      clienteId: 1,
      localidadOrigenId: f.localidadOrigenId,
      localidadDestinoId: f.localidadDestinoId,
      paradaOrigenVueltaId: null,
      paradaDestinoVueltaId: null
    };
    this.compraService.iniciarCompra(dto).subscribe(res => window.location.href = res.data.sessionUrl);
  }

  siguientePaso(): void {
    if (this.puedeAvanzar() && this.step < this.completedSteps.length) {
      this.completedSteps[this.step] = true;
      this.step++;
    }
  }

  anteriorPaso(): void {
    if (this.step > 0) {
      this.step--;
    }
  }

  puedeAvanzar(): boolean {
    if (this.step === 0) return this.searchForm.valid;
    if (this.step === 1) return this.viajeSeleccionado !== null;
    if (this.step === 2) return this.pasajerosForm.valid && this.selectedSeats.length > 0;
    return true;
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

  private formatFecha(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  calcularDuracion(inicio: string, fin: string): string {
    const d1 = new Date(inicio);
    const d2 = new Date(fin);
    const diffMs = d2.getTime() - d1.getTime();
    const minutos = Math.floor(diffMs / 60000);
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
  }
}
