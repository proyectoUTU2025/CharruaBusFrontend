import { Component, OnInit, AfterViewChecked, ViewChild, AfterViewInit } from '@angular/core';
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
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CompraRequestDto } from '../../models/compra';
import { ViajeService } from '../../services/viaje.service';
import { CompraViajeDto } from '../../models/viajes';
import { SeatsComponent } from '../seats/seats.component';
import { PurchaseSummaryDialogComponent } from './dialogs/purchase-summary-dialog/purchase-summary-dialog.component';
import { LocalidadService } from '../../services/localidades.service';
import { CompraService } from '../../services/compra.service';
import { SelectSeatsDialogComponent } from './dialogs/select-seats-dialog/select-seats-dialog.component';
import { LoginService } from '../../services/login.service';
import { UserService } from '../../services/user.service';
import { UsuarioDto } from '../../models';
import { ActivatedRoute } from '@angular/router';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';

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
    PurchaseSummaryDialogComponent,
    MatAutocompleteModule
  ],
  templateUrl: './compra-page.component.html',
  styleUrls: ['./compra-page.component.scss']
})
export class CompraPageComponent implements OnInit, AfterViewInit, AfterViewChecked {
  step = 0;
  completedSteps: boolean[] = [false, false, false, false, false];
  tipoViaje: 'IDA' | 'IDA_Y_VUELTA' = 'IDA';
  selectedTabIndex = 0;
  searchForm!: FormGroup;
  pasajerosForm!: FormGroup;
  localidades: any[] = [];
  destinos: any[] = [];
  viajes: CompraViajeSeleccionable[] = [];
  selectedSeats: number[] = [];
  viajeSeleccionado: CompraViajeDto | null = null;
  searchTerm: string = '';
  clientesFiltrados: UsuarioDto[] = [];

  userInfo: UsuarioDto | null = null;
  searchEmail: string = '';

  totalElements = 0;
  pageSize = 5;
  pageIndex = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('auto') auto!: MatAutocomplete;
  mostrarErrorOrigen = false;
  mostrarErrorDestino = false;
  origenError = '';
  destinoError = '';
  fechaError = '';
  estadoCompra: 'exito' | 'cancelado' | 'error' | null = null;

  constructor(
    private fb: FormBuilder,
    private localidadService: LocalidadService,
    private viajeService: ViajeService,
    private compraService: CompraService,
    private dialog: MatDialog,
    public loginService: LoginService,
    public userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      localidadOrigenId: [null, Validators.required],
      localidadDestinoId: [null, Validators.required],
      fechaDesde: [null, Validators.required],
      fechaVuelta: [null],
      pasajeros: [1, [Validators.min(1), Validators.max(5)]]
    });

    this.pasajerosForm = this.fb.group({ pasajeros: this.fb.array([]) });
    this.generarFormularioPasajeros(this.searchForm.value.pasajeros);
    this.searchForm.get('pasajeros')!.valueChanges.subscribe(n => this.generarFormularioPasajeros(n));

    this.localidadService.getLocalidadesOrigenValidas().subscribe(list => this.localidades = list);
    this.searchForm.get('localidadOrigenId')!.valueChanges.subscribe(id => {
      this.localidadService.getDestinosPosibles(id).subscribe(d => this.destinos = d);
    });

    if (this.loginService.rol === 'CLIENTE') {
      const id = this.loginService.id;
      if (id) {
        this.userService.getById(id).then(data => {
          this.userInfo = data;
        }).catch(() => {
          this.userInfo = null;
        });
      }
    }
  }

  ngAfterViewInit(): void {
    const url = this.route.snapshot.url.map(s => s.path).join('/');
    const estado = this.route.snapshot.queryParamMap.get('estado');

    if (url.includes('compras/exito') && estado === 'exito') {
      this.estadoCompra = 'exito';
      this.step = 5;
      this.completedSteps = [true, true, true, true, true];
    }

    if (url.includes('compras/cancelada') && estado === 'cancelado') {
      this.estadoCompra = 'cancelado';
      this.step = 5;
      this.completedSteps = [true, true, true, true, true];
    }

    if (url.includes('compras/cancelada') && estado === 'error') {
      this.estadoCompra = 'error';
      this.step = 5;
      this.completedSteps = [true, true, true, true, true];
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

  buscarUsuarioPorEmail(): void {
    if (!this.searchEmail.trim()) return;
    this.userService.buscarPorEmail(this.searchEmail).then(usuario => {
      this.userInfo = usuario;
    }).catch(() => {
      this.userInfo = null;
    });
  }

  cambiarTipoViaje(index: number): void {
    this.tipoViaje = index === 0 ? 'IDA' : 'IDA_Y_VUELTA';
    this.selectedTabIndex = index;
    this.searchForm.get('fechaVuelta')?.reset();
  }

  buscar(): void {
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
      .then(page => {
        this.viajes = page.content.map(v => ({ ...v, seleccionado: false }));
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

  seleccionarViaje(v: CompraViajeSeleccionable): void {
    this.viajes.forEach(viaje => viaje.seleccionado = false);
    v.seleccionado = true;
    this.viajeSeleccionado = v;
    this.completedSteps[1] = true;
  }

  abrirDialogPasajeros(): void {
    if (!this.viajeSeleccionado) return;

    const pasajeros = this.searchForm.value.pasajeros;
    const viajeId = this.viajeSeleccionado.idViaje;
    const cantidadAsientos = this.viajeSeleccionado.asientosDisponibles;

    if (!viajeId || !cantidadAsientos) return;

    const dialogRef = this.dialog.open(SelectSeatsDialogComponent, {
      width: '600px',
      data: {
        pasajeros,
        viajeId,
        cantidadAsientos,
        precio: this.viajeSeleccionado?.precioEstimado
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedSeats = result.asientos;
        this.completedSteps[2] = true;
      }
    });
  }

  confirmarCompra(): void {
    const f = this.searchForm.value;
    const clienteId = this.userInfo?.id || 0;
    const dto: CompraRequestDto = {
      viajeIdaId: this.viajeSeleccionado?.idViaje || 0,
      viajeVueltaId: null,
      asientosIda: this.selectedSeats,
      asientosVuelta: undefined,
      clienteId,
      localidadOrigenId: f.localidadOrigenId,
      localidadDestinoId: f.localidadDestinoId,
      paradaOrigenVueltaId: null,
      paradaDestinoVueltaId: null
    };
    this.compraService.iniciarCompra(dto).subscribe(res => window.location.href = res.data.sessionUrl);
  }

  siguientePaso(): void {
    if (this.step === 4) return; // No permitir avanzar manualmente al paso 5
    if (this.puedeAvanzar() && this.step < this.completedSteps.length) {
      this.completedSteps[this.step] = true;
      this.step++;
    }
  }

  anteriorPaso(): void {
    if (this.step > 0 && this.step < 5) {
      this.step--;
    }
  }

  puedeAvanzar(): boolean {
    if (this.step === 0) return this.searchForm.valid;
    if (this.step === 1) return this.viajeSeleccionado !== null;
    if (this.step === 2) return this.selectedSeats.length > 0;
    if (this.step === 3) return false; // Deshabilita avanzar desde "Resumen"
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

  buscarClientes(): void {
    const query = this.searchTerm.trim();
    if (query.length < 2) return;

    this.userService.buscarClientes(query, 0, 5).subscribe({
      next: (clientes) => {
        this.clientesFiltrados = clientes;
        console.log('Clientes filtrados:', this.clientesFiltrados);
      },
      error: (e) => {
        console.error('Error buscando clientes', e);
        this.clientesFiltrados = [];
      }
    });
  }

  displayCliente(cliente: UsuarioDto): string {
    if (!cliente) return '';
    return `${cliente.nombre ?? ''} ${cliente.apellido ?? ''}`.trim();
  }

  seleccionarCliente(cliente: UsuarioDto): void {
    this.userInfo = cliente;
    this.searchTerm = this.displayCliente(cliente);
    this.clientesFiltrados = [];
  }
}
