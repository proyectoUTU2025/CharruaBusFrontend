import { Component, OnInit, AfterViewInit, AfterViewChecked, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { CompraService } from '../../services/compra.service';
import { ViajeService } from '../../services/viaje.service';
import { CompraRequestDto } from '../../models/compra/compra.dto.model';
import { CompraViajeDto } from '../../models/viajes';
import { SeatsComponent } from '../seats/seats.component';
import { PurchaseSummaryDialogComponent } from './dialogs/purchase-summary-dialog/purchase-summary-dialog.component';
import { SelectSeatsDialogComponent } from './dialogs/select-seats-dialog/select-seats-dialog.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ActivatedRoute } from '@angular/router';

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
    MatTableModule,
    SeatsComponent,
    PurchaseSummaryDialogComponent,
    SelectSeatsDialogComponent
  ],
  templateUrl: './compra-page.component.html',
  styleUrls: ['./compra-page.component.scss']
})
export class CompraPageComponent implements OnInit, AfterViewInit, AfterViewChecked {
  step = 0;
  tipoViaje: 'IDA' | 'IDA_Y_VUELTA' = 'IDA';
  searchForm!: FormGroup;
  localidades: any[] = [];
  destinos: any[] = [];
  dataSource = new MatTableDataSource<CompraViajeDto>([]);
  displayedColumns = ['origen', 'destino', 'precio', 'seleccionar'];
  totalElements = 0;
  pageSize = 5;
  pageIndex = 0;

  selectedSeats: number[] = [];
  viajeIdaSeleccionado: CompraViajeDto | null = null;
  estadoCompra: 'exito' | 'cancelado' | 'error' | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private viajeService: ViajeService,
    private compraService: CompraService,
    private dialog: MatDialog,
    public authService: AuthService,
    public userService: UserService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      localidadOrigenId: [null, Validators.required],
      localidadDestinoId: [null, Validators.required],
      fechaDesde: [null, Validators.required],
      fechaVuelta: [null],
      pasajeros: [1, [Validators.min(1), Validators.max(5)]]
    });
  }

  ngAfterViewInit(): void {
    const estado = this.route.snapshot.queryParamMap.get('estado');
    if (estado) {
      this.estadoCompra = estado as any;
      this.step = 5;
    }
  }

  ngAfterViewChecked(): void {
  }

  cambiarTipoViaje(index: number): void {
    this.tipoViaje = index === 0 ? 'IDA' : 'IDA_Y_VUELTA';
    this.step = 0;
  }

  buscar(): void {
    if (this.searchForm.invalid) return;
    this.pageIndex = 0;
    this.buscarConPaginacion();
  }

  private formatFecha(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  buscarConPaginacion(): void {
    const f = this.searchForm.value;
    const filtro = {
      idLocalidadOrigen: f.localidadOrigenId,
      idLocalidadDestino: f.localidadDestinoId,
      fechaViaje: this.formatFecha(f.fechaDesde),
      cantidadPasajes: f.pasajeros
    };

    this.viajeService
      .buscarDisponibles(filtro, this.pageIndex, this.pageSize)
      .then((page: { content: CompraViajeDto[]; totalElements: number }) => {
        this.dataSource.data = page.content;
        this.totalElements = page.totalElements;
        this.step = 1;
      })
      .catch((err: any) => {
        console.error('Error al buscar viajes:', err);
      });
  }

  pageChanged(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.buscarConPaginacion();
  }

  seleccionarViaje(v: CompraViajeDto): void {
    this.viajeIdaSeleccionado = v;
    this.step = 2;
  }

  abrirDialogPasajeros(): void {
    if (!this.viajeIdaSeleccionado) return;
    const dialogRef = this.dialog.open(SelectSeatsDialogComponent, {
      width: '600px',
      data: { pasajeros: this.searchForm.value.pasajeros, viajeId: this.viajeIdaSeleccionado.idViaje }
    });
    dialogRef.afterClosed().subscribe((result: { asientos: number[] } | undefined) => {
      if (result) {
        this.selectedSeats = result.asientos;
        this.step = 3;
      }
    });
  }

  confirmarCompra(): void {
    const dto: CompraRequestDto = {
      viajeIdaId: this.viajeIdaSeleccionado?.idViaje || 0,
      asientosIda: this.selectedSeats,
      clienteId: this.authService.id || 0,
      localidadOrigenId: this.searchForm.value.localidadOrigenId,
      localidadDestinoId: this.searchForm.value.localidadDestinoId,
      viajeVueltaId: null,
      asientosVuelta: []
    };
    this.compraService.iniciarCompra(dto).subscribe(res => window.location.href = res.sessionUrl);
  }

  anteriorPaso(): void {
    if (this.step > 0) this.step--;
  }

  siguientePaso(): void {
    if (this.step < 5) this.step++;
  }
}
