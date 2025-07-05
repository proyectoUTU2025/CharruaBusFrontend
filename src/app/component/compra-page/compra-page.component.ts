import { AuthService } from './../../services/auth.service';
import { Component, OnInit, AfterViewInit, AfterViewChecked, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
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
import { ConfiguracionDelSistemaService } from '../../services/configuracion-del-sistema.service';
import { finalize } from 'rxjs';

type CompraViajeSeleccionable = CompraViajeDto & { seleccionado?: boolean };

export const origenDestinoValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const origen = control.get('localidadOrigenId');
  const destino = control.get('localidadDestinoId');

  if (!origen?.value || !destino?.value) {
    return null;
  }

  return origen.value === destino.value ? { origenDestinoIguales: true } : null;
};

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
  isLoadingConfig = true;
  isSearching = false;
  isLoadingDestinos = false;
  noViajesEncontrados = false;
  fechaMinima: Date;
  fechaMinimaVuelta: Date;
  maxPasajes = 5;
  opcionesPasajeros: number[] = [];
  isLoadingAsientos = false;
  isProcessingPayment = false;

  // Nuevas propiedades para el viaje de vuelta
  isSearchingVuelta = false;
  noViajesVueltaEncontrados = false;
  totalElementsVuelta = 0;
  pageIndexVuelta = 0;
  pageSizeVuelta = 5;

  // Propiedades para cálculo de precios
  subtotal = 0;
  montoDescuento = 0;
  precioFinal = 0;
  nombreDescuento: string | null = null;
  isLoadingPrecios = false;

  constructor(
    private fb: FormBuilder,
    private localidadService: LocalidadService,
    private viajeService: ViajeService,
    private compraService: CompraService,
    private configuracionService: ConfiguracionDelSistemaService,
    public dialog: MatDialog,
    public authService: AuthService,
    public userService: UserService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.fechaMinima = new Date();
    this.fechaMinimaVuelta = new Date();
  }

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
    }, { validators: origenDestinoValidator });

    this.searchForm.get('tipoViaje')!.valueChanges.subscribe(value => {
      if (value === 'IDA') {
        this.searchForm.get('fechaVuelta')?.reset();
        this.searchForm.get('fechaVuelta')?.clearValidators();
      } else {
        this.searchForm.get('fechaVuelta')?.setValidators(Validators.required);
      }
      this.searchForm.get('fechaVuelta')?.updateValueAndValidity();
    });

    this.searchForm.get('fechaDesde')?.valueChanges.subscribe(value => {
      if (value) {
        this.fechaMinimaVuelta = value;
        const fechaVueltaControl = this.searchForm.get('fechaVuelta');
        if (fechaVueltaControl?.value && fechaVueltaControl.value < value) {
          fechaVueltaControl.setValue(null);
        }
      }
    });

    this.configuracionService.findByNombre('limite_pasajes')
      .pipe(
        finalize(() => {
          this.isLoadingConfig = false;
          this.actualizarOpcionesPasajeros();
        })
      )
      .subscribe({
        next: (config) => {
          if (config && config.valorInt) {
            this.maxPasajes = config.valorInt;
          }
        },
        error: () => {
          console.error('No se pudo obtener el límite de pasajes, se usará el valor por defecto.');
        }
    });

    this.pasajerosForm = this.fb.group({ pasajeros: this.fb.array([]) });
    this.searchForm.get('pasajeros')!.valueChanges.subscribe(n => this.generarFormularioPasajeros(n));
    this.localidadService.getLocalidadesOrigenValidas().subscribe(list => this.localidades = list);
    this.searchForm.get('localidadOrigenId')!.valueChanges.subscribe(origenId => {
      this.destinos = [];
      this.searchForm.get('localidadDestinoId')?.setValue(null);
      
      if (origenId) {
        this.isLoadingDestinos = true;
        this.localidadService.getDestinosPosibles(origenId)
          .pipe(finalize(() => this.isLoadingDestinos = false))
          .subscribe(d => {
            this.destinos = d;
          });
      }
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
    if (url.includes('compras/redirect/exito') && estado === 'exito') {
      this.estadoCompra = 'exito';
      this.step = finalStep;
    }
    if (url.includes('compras/redirect/cancelada') && estado === 'cancelado') {
      this.estadoCompra = 'cancelado';
      this.step = finalStep;
    }
    if (url.includes('compras/redirect/cancelada') && estado === 'error') {
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
    if (this.searchForm.invalid) {
      return;
    }

    // Reset selections
    this.viajeIdaSeleccionado = null;
    this.viajeVueltaSeleccionado = null;
    this.selectedSeats = [];
    this.selectedSeatsVuelta = [];
    this.asientosOcupadosIda = [];
    this.asientosOcupadosVuelta = [];

    this.step = 1;
    this.pageIndex = 0;
    this.viajes = [];
    this.noViajesEncontrados = false;
    this.isSearching = true;
    this.cdr.detectChanges();
    this.buscarConPaginacion();
  }

  buscarConPaginacion(): void {
    const f = this.searchForm.value;
    if (!f.fechaDesde) {
      this.isSearching = false;
      return;
    }
    const filtro = {
      idLocalidadOrigen: f.localidadOrigenId,
      idLocalidadDestino: f.localidadDestinoId,
      fechaViaje: this.formatFecha(f.fechaDesde),
      cantidadPasajes: f.pasajeros
    };
    this.viajeService.buscarDisponibles(filtro, this.pageIndex, this.pageSize)
      .pipe(
        finalize(() => this.isSearching = false)
      )
      .subscribe(page => {
        this.viajes = page.content.map(v => ({
          ...v,
          seleccionado: this.viajeIdaSeleccionado?.idViaje === v.idViaje
        }));
        this.totalElements = page.page.totalElements;
        this.pageIndex = page.page.number;
        if (this.viajes.length === 0) {
          this.noViajesEncontrados = true;
        }
      });
  }


  buscarViajesVueltaConPaginacion(): void {
    this.isSearchingVuelta = true;
    this.noViajesVueltaEncontrados = false;
    const f = this.searchForm.value;
    const filtro = {
      idLocalidadOrigen: f.localidadDestinoId,
      idLocalidadDestino: f.localidadOrigenId,
      fechaViaje: this.formatFecha(f.fechaVuelta),
      cantidadPasajes: f.pasajeros
    };
    const fechaLlegadaIda = new Date(this.viajeIdaSeleccionado?.fechaHoraLlegada || '');
    this.viajeService.buscarDisponibles(filtro, this.pageIndexVuelta, this.pageSizeVuelta)
      .pipe(
        finalize(() => this.isSearchingVuelta = false)
      )
      .subscribe(page => {
        const viajesFiltrados = page.content
          .filter(v => new Date(v.fechaHoraSalida) > fechaLlegadaIda)
          .map(v => ({
            ...v,
            seleccionado: this.viajeVueltaSeleccionado?.idViaje === v.idViaje
          }));

        this.viajesVuelta = viajesFiltrados;
        this.totalElementsVuelta = viajesFiltrados.length;
        this.pageIndexVuelta = page.page.number;

        if (this.viajesVuelta.length === 0) {
          if (page.page.number < page.page.totalPages - 1) {
            this.pageIndexVuelta++;
            this.buscarViajesVueltaConPaginacion();
          } else {
            this.noViajesVueltaEncontrados = true;
          }
        }
      });
  }

  cambiarPagina(event: PageEvent): void {
    this.isSearching = true;
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.buscarConPaginacion();
  }

  cambiarPaginaVuelta(event: PageEvent): void {
    this.isSearchingVuelta = true;
    this.pageIndexVuelta = event.pageIndex;
    this.pageSizeVuelta = event.pageSize;
    this.buscarViajesVueltaConPaginacion();
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

  seleccionarViaje(viaje: CompraViajeSeleccionable, esVuelta = false): void {
    if (esVuelta) {
      if (this.viajeVueltaSeleccionado && this.viajeVueltaSeleccionado.idViaje === viaje.idViaje) {
        this.viajeVueltaSeleccionado = null;
        viaje.seleccionado = false;
      } else {
        this.viajesVuelta.forEach(v => v.seleccionado = false);
        viaje.seleccionado = true;
        this.viajeVueltaSeleccionado = viaje;
        this.selectedSeatsVuelta = [];
        this.isLoadingAsientos = true;
        this.cargarAsientosOcupados(viaje.idViaje, esVuelta);
      }
    } else {
      if (this.viajeIdaSeleccionado && this.viajeIdaSeleccionado.idViaje === viaje.idViaje) {
        this.viajeIdaSeleccionado = null;
        viaje.seleccionado = false;
      } else {
        this.viajes.forEach(v => v.seleccionado = false);
        viaje.seleccionado = true;
        this.viajeIdaSeleccionado = viaje;
        this.selectedSeats = [];
        this.isLoadingAsientos = true;
        this.cargarAsientosOcupados(viaje.idViaje, esVuelta);
      }
    }
  }

  private cargarAsientosOcupados(viajeId: number, esVuelta: boolean): void {
    this.viajeService.getOcupados(viajeId).subscribe((ocupados: number[]) => {
      if (esVuelta) {
        this.asientosOcupadosVuelta = ocupados;
      } else {
        this.asientosOcupadosIda = ocupados;
      }
      this.isLoadingAsientos = false;
    });
  }

  onAsientosIdaChange(asientos: number[]): void {
    this.selectedSeats = asientos;
  }

  onAsientosVueltaChange(asientos: number[]): void {
    this.selectedSeatsVuelta = asientos;
  }

  abrirDialogPasajeros(esVuelta: boolean = false): void {
    // This method is now obsolete
  }

  confirmarCompra(): void {
    if (!this.puedeConfirmar()) return;

    this.isProcessingPayment = true;

    const request: CompraRequestDto = {
      viajeIdaId: this.viajeIdaSeleccionado!.idViaje,
      viajeVueltaId: this.viajeVueltaSeleccionado?.idViaje || null,
      asientosIda: this.selectedSeats,
      asientosVuelta: this.selectedSeatsVuelta,
      clienteId: this.userInfo!.id,
      localidadOrigenId: this.searchForm.value.localidadOrigenId!,
      localidadDestinoId: this.searchForm.value.localidadDestinoId!,
      paradaOrigenVueltaId: this.viajeVueltaSeleccionado?.idViaje ? this.searchForm.value.localidadDestinoId : null,
      paradaDestinoVueltaId: this.viajeVueltaSeleccionado?.idViaje ? this.searchForm.value.localidadOrigenId : null
    };

    this.compraService.iniciarCompra(request).subscribe({
      next: (response) => {
        this.isProcessingPayment = false;
        if (response && response.sessionUrl) {
          window.location.href = response.sessionUrl;
        } else {
          console.error('La respuesta del servidor no contiene una sessionUrl válida.', response);
        }
      },
      error: err => {
        this.isProcessingPayment = false;
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
  
      if (this.tipoViaje === 'IDA_Y_VUELTA' && this.step === 2) {
        this.step++;
        this.buscarViajesVueltaConPaginacion();
        return;
      }
  
      this.step++;

      const esDatosCliente = (this.tipoViaje === 'IDA' && this.step === 3) || (this.tipoViaje === 'IDA_Y_VUELTA' && this.step === 5);
      if (esDatosCliente) {
        this.reFetchClientInfoIfNeeded();
      }

      const esResumenIda = this.tipoViaje === 'IDA' && this.step === 4;
      const esResumenIdaVuelta = this.tipoViaje === 'IDA_Y_VUELTA' && this.step === 6;

      if (esResumenIda || esResumenIdaVuelta) {
        this.calcularPreciosFinales();
      }
    }
  }

  anteriorPaso(): void {
    if (this.step > 0) {
      this.step--;

      const esDatosCliente = (this.tipoViaje === 'IDA' && this.step === 3) || (this.tipoViaje === 'IDA_Y_VUELTA' && this.step === 5);
      if (esDatosCliente) {
        this.reFetchClientInfoIfNeeded();
      }

      if (this.step === 3 && this.tipoViaje === 'IDA_Y_VUELTA') {
        this.selectedSeatsVuelta = [];
        this.asientosOcupadosVuelta = [];
      }

      if (this.step === 2 && this.tipoViaje === 'IDA_Y_VUELTA') {
        this.viajeVueltaSeleccionado = null;
        this.viajesVuelta.forEach(v => (v.seleccionado = false));
        this.selectedSeatsVuelta = [];
        this.asientosOcupadosVuelta = [];
      }

      if (this.step === 0) {
        this.viajeIdaSeleccionado = null;
        this.viajes.forEach(v => (v.seleccionado = false));
        this.viajesVuelta.forEach(v => (v.seleccionado = false));
        this.selectedSeats = [];
        this.selectedSeatsVuelta = [];
        this.asientosOcupadosIda = [];
        this.asientosOcupadosVuelta = [];
      }
    }
  }

  puedeAvanzar(): boolean {
    const cantidadPasajeros = this.searchForm.value.pasajeros || 1;
    
    switch (this.step) {
      case 0:
        return this.searchForm.valid;
      case 1:
        return this.viajeIdaSeleccionado !== null;
      case 2:
        return this.selectedSeats.length === cantidadPasajeros;
      case 3:
        if (this.tipoViaje === 'IDA') {
          return this.userInfo !== null;
        } else {
          return this.viajeVueltaSeleccionado !== null;
        }
      case 4:
        if (this.tipoViaje === 'IDA') return false;
        return this.selectedSeatsVuelta.length === cantidadPasajeros;
      case 5:
        if (this.tipoViaje === 'IDA') return false;
        return this.userInfo !== null;
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
    if (q.length < 2) {
      this.clientesFiltrados = [];
      return;
    }
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
    this.searchTerm = '';
  }

  limpiarClienteSeleccionado(): void {
    this.userInfo = null;
    this.searchTerm = '';
  }

  esIdaYVuelta(): boolean {
    return this.searchForm.value.tipoViaje === 'IDA_Y_VUELTA';
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

  hasOrigenDestinoError(): boolean {
    return !!(this.searchForm.hasError('origenDestinoIguales') && 
           (this.searchForm.get('localidadOrigenId')?.touched || this.searchForm.get('localidadDestinoId')?.touched));
  }

  private actualizarOpcionesPasajeros(): void {
    this.opcionesPasajeros = Array.from({ length: this.maxPasajes }, (_, i) => i + 1);
  }

  // Métodos para formatear fechas en español
  formatearFechaSalida(esVuelta = false): string {
    const viaje = esVuelta ? this.viajeVueltaSeleccionado : this.viajeIdaSeleccionado;
    if (!viaje?.fechaHoraSalida) return '';
    const fecha = new Date(viaje.fechaHoraSalida);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' };
    return fecha.toLocaleDateString('es-ES', options);
  }

  formatearFechaLlegada(esVuelta = false): string {
    const viaje = esVuelta ? this.viajeVueltaSeleccionado : this.viajeIdaSeleccionado;
    if (!viaje?.fechaHoraLlegada) return '';
    const fecha = new Date(viaje.fechaHoraLlegada);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' };
    return fecha.toLocaleDateString('es-ES', options);
  }

  formatearHoraSalida(esVuelta = false): string {
    const viaje = esVuelta ? this.viajeVueltaSeleccionado : this.viajeIdaSeleccionado;
    if (!viaje?.fechaHoraSalida) return '';
    const fecha = new Date(viaje.fechaHoraSalida);
    return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  }

  formatearHoraLlegada(esVuelta = false): string {
    const viaje = esVuelta ? this.viajeVueltaSeleccionado : this.viajeIdaSeleccionado;
    if (!viaje?.fechaHoraLlegada) return '';
    const fecha = new Date(viaje.fechaHoraLlegada);
    return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  }

  formatearOrigen(esVuelta = false): string {
    const viaje = esVuelta ? this.viajeVueltaSeleccionado : this.viajeIdaSeleccionado;
    return viaje?.origen || '';
  }

  formatearDestino(esVuelta = false): string {
    const viaje = esVuelta ? this.viajeVueltaSeleccionado : this.viajeIdaSeleccionado;
    return viaje?.destino || '';
  }

  calcularSubtotal(): number {
    const precioIda = this.viajeIdaSeleccionado?.precioEstimado || 0;
    const precioVuelta = this.viajeVueltaSeleccionado?.precioEstimado || 0;
    const cantidadPasajeros = this.searchForm.value.pasajeros || 1;
    
    if (this.tipoViaje === 'IDA_Y_VUELTA') {
      return (precioIda + precioVuelta) * cantidadPasajeros;
    }
    return precioIda * cantidadPasajeros;
  }

  formatearAsientosSeleccionados(esVuelta = false): string {
    const asientos = esVuelta ? this.selectedSeatsVuelta : this.selectedSeats;
    if (asientos.length === 0) return '';
    return asientos.sort((a, b) => a - b).join(', ');
  }

  obtenerCapacidadOmnibus(): number {
    return (this.viajeIdaSeleccionado?.asientosDisponibles || 0) + this.asientosOcupadosIda.length;
  }

  calcularPreciosFinales(): void {
    this.isLoadingPrecios = true;
    this.subtotal = this.calcularSubtotal();
    this.montoDescuento = 0;
    this.precioFinal = this.subtotal;
    this.nombreDescuento = null;
  
    if (!this.userInfo || !this.userInfo.situacionLaboral || this.userInfo.situacionLaboral === 'OTRO') {
      this.isLoadingPrecios = false;
      return;
    }
  
    const situacion = this.userInfo.situacionLaboral;
    let configNombre = '';
  
    if (situacion === 'ESTUDIANTE') {
      configNombre = 'descuento_estudiante';
      this.nombreDescuento = 'Descuento Estudiante';
    } else if (situacion === 'JUBILADO') {
      configNombre = 'descuento_jubilado';
      this.nombreDescuento = 'Descuento Jubilado';
    } else {
      this.isLoadingPrecios = false;
      return;
    }
    
    this.configuracionService.findByNombre(configNombre)
      .pipe(finalize(() => this.isLoadingPrecios = false))
      .subscribe({
        next: (config) => {
          if (config && config.valorInt) {
            const descuentoPorcentaje = config.valorInt;
            this.montoDescuento = this.subtotal * (descuentoPorcentaje / 100);
            this.precioFinal = this.subtotal - this.montoDescuento;
          } else {
            this.montoDescuento = 0;
            this.precioFinal = this.subtotal;
            this.nombreDescuento = null;
          }
        },
        error: (err) => {
          console.error(`Error al obtener configuración de descuento para ${configNombre}`, err);
          this.montoDescuento = 0;
          this.precioFinal = this.subtotal;
          this.nombreDescuento = null;
        }
      });
  }

  private reFetchClientInfoIfNeeded(): void {
    if (this.authService.rol === 'CLIENTE' && !this.userInfo) {
      const id = this.authService.id;
      if (id) {
        this.userService.getById(id)
          .then((data: UsuarioDto) => this.userInfo = data)
          .catch(() => this.userInfo = null);
      }
    }
  }
}
