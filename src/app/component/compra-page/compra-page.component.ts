import { AuthService } from './../../services/auth.service';
import { Component, OnInit, AfterViewInit, AfterViewChecked, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { CompraRequestDto } from '../../models/compra';
import { ViajeService } from '../../services/viaje.service';
import { CompraViajeDto } from '../../models/viajes';
import { SeatsComponent } from '../seats/seats.component';
import { LocalidadService } from '../../services/localidades.service';
import { CompraService } from '../../services/compra.service';
import { UserService } from '../../services/user.service';
import { UsuarioDto } from '../../models';
import { ActivatedRoute } from '@angular/router';
import { SelectSeatsDialogComponent } from './dialogs/select-seats-dialog/select-seats-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

type CompraViajeSeleccionable = CompraViajeDto & { seleccionado?: boolean };

@Component({
  selector: 'app-compra-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
    MatAutocompleteModule,
    MatRadioModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './compra-page.component.html',
  styleUrls: ['./compra-page.component.scss']
})
export class CompraPageComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @ViewChild('stepper') stepper!: MatStepper;
  @ViewChild('paginatorIda') paginatorIda!: MatPaginator;
  step = 0;
  completedSteps: boolean[] = [false, false, false, false, false, false, false];
  searchForm!: FormGroup;
  pasajerosForm!: FormGroup;
  localidades: any[] = [];
  destinos: any[] = [];
  viajes: CompraViajeSeleccionable[] = [];
  viajesVuelta: CompraViajeSeleccionable[] = [];
  selectedSeats: number[] = [];
  selectedSeatsVuelta: number[] = [];
  asientosOcupadosIda: number[] = [];
  asientosOcupadosVuelta: number[] = [];
  viajeIdaSeleccionado: CompraViajeDto | null = null;
  viajeVueltaSeleccionado: CompraViajeDto | null = null;
  searchTerm = '';
  clientesFiltrados: UsuarioDto[] = [];
  userInfo: UsuarioDto | null = null;
  origenError = '';
  destinoError = '';
  fechaError = '';
  estadoCompra: 'exito' | 'cancelado' | 'error' | null = null;
  totalElements = 0;
  pageSize = 5;
  pageIndex = 0;
  pasoAsientosVuelta = new FormGroup({});
  isLoadingNextStep = false;

  constructor(
    private fb: FormBuilder,
    private localidadService: LocalidadService,
    private viajeService: ViajeService,
    private compraService: CompraService,
    public dialog: MatDialog,
    public authService: AuthService,
    public userService: UserService,
    private route: ActivatedRoute
  ) { }

  get tipoViaje(): 'IDA' | 'IDA_Y_VUELTA' {
    return this.searchForm.get('tipoViaje')?.value;
  }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      tipoViaje: ['IDA', Validators.required],
      localidadOrigenId: [null, Validators.required],
      localidadDestinoId: [null, Validators.required],
      fechaDesde: [null, Validators.required],
      fechaVuelta: [null],
      pasajeros: [1, [Validators.min(1), Validators.max(5)]]
    });

    this.searchForm.get('tipoViaje')!.valueChanges.subscribe(value => {
      if (value === 'IDA') {
        this.searchForm.get('fechaVuelta')?.reset();
        this.searchForm.get('fechaVuelta')?.clearValidators();
      } else {
        this.searchForm.get('fechaVuelta')?.setValidators(Validators.required);
      }
      this.searchForm.get('fechaVuelta')?.updateValueAndValidity();
    });

    this.pasajerosForm = this.fb.group({ pasajeros: this.fb.array([]) });
    this.searchForm.get('pasajeros')!.valueChanges.subscribe(n => this.generarFormularioPasajeros(n));
    this.localidadService.getLocalidadesOrigenValidas().subscribe(list => this.localidades = list);
    this.searchForm.get('localidadOrigenId')!.valueChanges.subscribe(id => {
      this.localidadService.getDestinosPosibles(id).subscribe(d => this.destinos = d);
    });

    if (this.authService.rol === 'CLIENTE') {
      const id = this.authService.id;
      if (id) {
        this.userService.getById(id)
          .then((data: UsuarioDto) => this.userInfo = data)
          .catch(() => this.userInfo = null);
      }
    }
  }

  ngAfterViewInit(): void {
    const url = this.route.snapshot.url.map(s => s.path).join('/');
    const estado = this.route.snapshot.queryParamMap.get('estado');
    const finalStep = this.tipoViaje === 'IDA' ? 4 : 6;
    if (url.includes('compras/exito') && estado === 'exito') {
      this.estadoCompra = 'exito';
      this.step = finalStep;
    }
    if (url.includes('compras/cancelada') && estado === 'cancelado') {
      this.estadoCompra = 'cancelado';
      this.step = finalStep;
    }
    if (url.includes('compras/cancelada') && estado === 'error') {
      this.estadoCompra = 'error';
      this.step = finalStep;
    }
  }

  get pasajeros(): FormArray {
    return this.pasajerosForm.get('pasajeros') as FormArray;
  }

  private generarFormularioPasajeros(cantidad: number): void {
    const array = this.fb.array<FormGroup>([]);
    for (let i = 0; i < cantidad; i++) {
      array.push(this.fb.group({
        nombre: ['', Validators.required],
        documento: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        telefono: ['', Validators.required],
        direccion: ['', Validators.required]
      }));
    }
    this.pasajerosForm.setControl('pasajeros', array);
  }

  buscar(): void {
    console.log('Iniciando búsqueda...');
    console.log('Estado del formulario:', this.searchForm.valid ? 'Válido' : 'Inválido');
    console.log('Valores del formulario:', this.searchForm.value);

    this.origenError = '';
    this.destinoError = '';
    this.fechaError = '';
    const f = this.searchForm.value;
    if (!f.localidadOrigenId) this.origenError = 'Debe seleccionar un origen.';
    if (!f.localidadDestinoId) this.destinoError = 'Debe seleccionar un destino.';
    if (!f.fechaDesde) this.fechaError = 'Debe seleccionar una fecha de ida.';
    if (this.origenError || this.destinoError || this.fechaError) return;
    this.pageIndex = 0;
    this.buscarConPaginacion();
  }
  buscarConPaginacion(): void {
    const f = this.searchForm.value;
    if (!f.fechaDesde) return;
    const filtro = {
      idLocalidadOrigen: f.localidadOrigenId,
      idLocalidadDestino: f.localidadDestinoId,
      fechaViaje: this.formatFecha(f.fechaDesde),
      cantidadPasajes: f.pasajeros
    };
    this.viajeService.buscarDisponibles(filtro, this.pageIndex, this.pageSize)
      .subscribe(page => {
        this.viajes = page.content.map(v => ({ ...v, seleccionado: false }));
        this.totalElements = page.page.totalElements;
        this.pageIndex = page.page.number;
        this.step = 1;
      });
  }


  buscarViajesVuelta(): void {
    const f = this.searchForm.value;
    const filtro = {
      idLocalidadOrigen: f.localidadDestinoId,
      idLocalidadDestino: f.localidadOrigenId,
      fechaViaje: this.formatFecha(f.fechaVuelta),
      cantidadPasajes: f.pasajeros
    };
    const fechaLlegadaIda = new Date(this.viajeIdaSeleccionado?.fechaHoraLlegada || '');
    this.viajeService.buscarDisponibles(filtro, 0, 10)
      .subscribe(page => {
        this.viajesVuelta = page.content
          .filter(v => new Date(v.fechaHoraSalida) > fechaLlegadaIda)
          .map(v => ({ ...v, seleccionado: false }));
        this.step = 3;
      });
  }

  cambiarPagina(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.buscarConPaginacion();
  }

  limpiarFiltros(): void {
    this.searchForm.reset({ tipoViaje: 'IDA', pasajeros: 1 });
    this.destinos = this.localidades;
    this.viajes = [];
    this.viajesVuelta = [];
    this.selectedSeats = [];
    this.selectedSeatsVuelta = [];
    this.viajeIdaSeleccionado = null;
    this.viajeVueltaSeleccionado = null;
    this.step = 0;
    this.completedSteps.fill(false);
  }

  seleccionarViaje(v: CompraViajeSeleccionable, esVuelta: boolean = false): void {
    if (!v.seleccionado) {
      if (esVuelta) {
        this.viajesVuelta.forEach(r => r.seleccionado = false);
        this.viajeVueltaSeleccionado = v;
      } else {
        this.viajes.forEach(r => r.seleccionado = false);
        this.viajeIdaSeleccionado = v;
      }
      v.seleccionado = true;
      this.cargarAsientosOcupados(v.idViaje, esVuelta);
    }
  }

  private cargarAsientosOcupados(viajeId: number, esVuelta: boolean): void {
    this.viajeService.getOcupados(viajeId).subscribe((ocupados: number[]) => {
      if (esVuelta) {
        this.asientosOcupadosVuelta = ocupados;
      } else {
        this.asientosOcupadosIda = ocupados;
      }
    });
  }

  onAsientosIdaChange(asientos: number[]): void {
    this.selectedSeats = asientos;
    if (this.selectedSeats.length === this.searchForm.value.pasajeros) {
      this.iniciarAvanceAutomatico();
    }
  }

  onAsientosVueltaChange(asientos: number[]): void {
    this.selectedSeatsVuelta = asientos;
    if (this.selectedSeatsVuelta.length === this.searchForm.value.pasajeros) {
      this.iniciarAvanceAutomatico();
    }
  }

  private iniciarAvanceAutomatico(): void {
    this.isLoadingNextStep = true;
    setTimeout(() => {
      this.siguientePaso();
      this.isLoadingNextStep = false;
    }, 2000);
  }

  abrirDialogPasajeros(esVuelta: boolean = false): void {
    // This method is now obsolete
  }

  confirmarCompra(): void {
    if (!this.puedeConfirmar()) {
      console.error("Intento de confirmar compra sin datos válidos.");
      return;
    }

    const f = this.searchForm.value;
    const clienteId = this.userInfo!.id;
    
    let dto: CompraRequestDto = {
      viajeIdaId: this.viajeIdaSeleccionado!.idViaje,
      asientosIda: this.selectedSeats,
      clienteId,
      localidadOrigenId: f.localidadOrigenId,
      localidadDestinoId: f.localidadDestinoId,
    };

    if (this.tipoViaje === 'IDA_Y_VUELTA') {
      dto = {
        ...dto,
        viajeVueltaId: this.viajeVueltaSeleccionado!.idViaje,
        asientosVuelta: this.selectedSeatsVuelta,
        paradaOrigenVueltaId: f.localidadDestinoId,
        paradaDestinoVueltaId: f.localidadOrigenId,
      };
    }

    console.log('Enviando DTO al backend:', JSON.stringify(dto, null, 2));

    this.compraService.iniciarCompra(dto)
      .subscribe({
        next: res => {
          if (res && res.sessionUrl) {
            window.location.href = res.sessionUrl;
          } else {
            console.error('La respuesta del servidor no contiene una sessionUrl válida.', res);
          }
        },
        error: err => {
          console.error('Error al iniciar la compra:', err);
        }
      });
  }

  puedeConfirmar(): boolean {
    console.log('Verificando puedeConfirmar:');
    console.log('viajeIdaSeleccionado:', !!this.viajeIdaSeleccionado);
    console.log('userInfo?.id:', this.userInfo?.id);
    console.log('selectedSeats.length:', this.selectedSeats.length);
    
    if (!this.viajeIdaSeleccionado || !this.userInfo?.id || this.selectedSeats.length === 0) {
      return false;
    }
    if (this.tipoViaje === 'IDA_Y_VUELTA') {
      console.log('Es IDA_Y_VUELTA. Verificando datos de vuelta.');
      console.log('viajeVueltaSeleccionado:', !!this.viajeVueltaSeleccionado);
      console.log('selectedSeatsVuelta.length:', this.selectedSeatsVuelta.length);
      if (!this.viajeVueltaSeleccionado || this.selectedSeatsVuelta.length === 0) {
        return false;
      }
    }
    return true;
  }

  siguientePaso(): void {
    if (this.puedeAvanzar()) {
      this.completedSteps[this.step] = true;
      if (this.tipoViaje === 'IDA_Y_VUELTA' && this.step === 3) {
        this.step++;
        this.buscarViajesVuelta();
      } else {
        this.step++;
      }
    }
  }

  anteriorPaso(): void {
    if (this.step > 0) this.step--;
  }

  puedeAvanzar(): boolean {
    switch (this.step) {
      case 0:
        return this.searchForm.valid;
      case 1:
        return this.viajeIdaSeleccionado !== null;
      case 2:
        return this.userInfo !== null;
      case 3:
        if (this.tipoViaje === 'IDA') {
          return this.selectedSeats.length > 0;
        } else { // IDA_Y_VUELTA
          return this.selectedSeats.length > 0;
        }
      case 4: // Solo IDA_Y_VUELTA
        return this.viajeVueltaSeleccionado !== null;
      case 5: // Solo IDA_Y_VUELTA
        return this.selectedSeatsVuelta.length > 0;
      default:
        return false;
    }
  }

  ngAfterViewChecked(): void {
    const headers = document.querySelectorAll('.mat-horizontal-stepper-header');
    headers.forEach((h, i) => {
      const icon = h.querySelector('.mat-step-icon') as HTMLElement;
      const label = h.querySelector('.mat-step-label') as HTMLElement;
      if (i < this.step) {
        icon.style.backgroundColor = '#3e5f3c';
        label.style.color = '#3e5f3c';
      } else if (i === this.step) {
        icon.style.backgroundColor = '#1976d2';
        label.style.color = '#1976d2';
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

  buscarClientes(): void {
    const q = this.searchTerm.trim();
    if (q.length < 2) return;
    this.userService.buscarClientes(q, 0, 5).subscribe({
      next: c => this.clientesFiltrados = c,
      error: () => this.clientesFiltrados = []
    });
  }

  displayCliente(c: UsuarioDto): string {
    return c && c.nombre && c.apellido ? `${c.nombre} ${c.apellido}` : '';
  }

  seleccionarCliente(c: UsuarioDto): void {
    this.userInfo = c;
    this.clientesFiltrados = [];
  }

  esIdaYVuelta(): boolean {
    return this.searchForm.value.tipoViaje === 'IDA_Y_VUELTA';
  }

  onIdaTripSelect(viaje: CompraViajeDto): void {
    // ... existing code ...
  }

  abrirDialogoAsientos(esVuelta: boolean): void {
    const viajeSeleccionado = esVuelta ? this.viajeVueltaSeleccionado : this.viajeIdaSeleccionado;
    if (!viajeSeleccionado) return;

    const dialogRef = this.dialog.open(SelectSeatsDialogComponent, {
      width: '800px',
      data: {
        totalAsientos: viajeSeleccionado.asientosDisponibles + (esVuelta ? this.asientosOcupadosVuelta.length : this.asientosOcupadosIda.length),
        asientosOcupados: esVuelta ? this.asientosOcupadosVuelta : this.asientosOcupadosIda,
        asientosSeleccionados: esVuelta ? this.selectedSeatsVuelta : this.selectedSeats,
        maxSeleccion: this.searchForm.value.pasajeros
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (esVuelta) {
          this.onAsientosVueltaChange(result);
        } else {
          this.onAsientosIdaChange(result);
        }
      }
    });
  }
}
