import { Component, Inject, ViewEncapsulation, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DetalleViajeDto, AsientoDto } from '../../../../models/viajes';
import { ReasignarOmnibusDialogComponent } from '../reasignar-omnibus-dialog/reasignar-omnibus-dialog.component';
import { DetallePasajeCompletoDialogComponent } from '../../../shared/detalle-pasaje-completo-dialog/detalle-pasaje-completo-dialog.component';
import { PasajeService } from '../../../../services/pasaje.service';
import { PasajeDto, TipoEstadoPasaje, FiltroPasajeViajeDto } from '../../../../models/pasajes';
import { MaterialUtilsService } from '../../../../shared/material-utils.service';



@Component({
  selector: 'app-viaje-detalle-dialog',
  standalone: true,
  templateUrl: './viaje-detalle-dialog.component.html',
  styleUrls: ['./viaje-detalle-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatIconModule,
    MatTabsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatChipsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatGridListModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatTooltipModule,
    ReactiveFormsModule
  ],
})
export class ViajeDetalleDialogComponent implements OnInit {
  selectedTabIndex = 0;
  pasajes: PasajeDto[] = [];
  pasajesFiltrados: PasajeDto[] = [];
  isLoadingPasajes = false;
  estadoFilter = new FormControl('todos');
  fechaDesdeFilter = new FormControl();
  fechaHastaFilter = new FormControl();
  origenFilter = new FormControl('todas');
  destinoFilter = new FormControl('todas');
  numeroAsientoFilter = new FormControl(null, [Validators.min(1)]);
  
  // Paginación
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  pageSizeOptions = [5, 10];
  
  displayedColumns = ['id', 'asiento', 'origen', 'destino', 'subtotal', 'estado', 'fechaCompra', 'acciones'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { viaje: DetalleViajeDto },
    private dialogRef: MatDialogRef<ViajeDetalleDialogComponent>,
    private dialog: MatDialog,
    private pasajeService: PasajeService,
    private materialUtils: MaterialUtilsService
  ) {}

  ngOnInit() {
    // Los filtros solo se aplicarán cuando se presione el botón "Buscar"
    // Agregar validador máximo dinámico basado en la cantidad de asientos del viaje
    this.numeroAsientoFilter.setValidators([
      Validators.min(1),
      Validators.max(this.cantidadMaximaAsientos)
    ]);
  }

  onTabChange(index: number) {
    this.selectedTabIndex = index;
    // Pestaña 2 = Historial de Pasajes (índice 2 porque es la tercera pestaña)
    if (index === 2 && this.pasajes.length === 0) {
      this.cargarPasajes();
    }
  }

  cargarPasajes() {
    this.isLoadingPasajes = true;
    
    const filtro: FiltroPasajeViajeDto = {};
    
    this.pasajeService.getPasajesPorViaje(this.data.viaje.id, filtro, this.currentPage, this.pageSize)
      .subscribe({
        next: (page) => {
          this.pasajes = page.content;
          this.pasajesFiltrados = [...this.pasajes];
          this.totalElements = page.page.totalElements;
          this.isLoadingPasajes = false;
        },
        error: (error) => {
          console.error('Error al cargar pasajes:', error);
          this.materialUtils.showError('Error al cargar el historial de pasajes');
          this.isLoadingPasajes = false;
          this.pasajes = [];
          this.pasajesFiltrados = [];
          this.totalElements = 0;
        }
      });
  }







  /**
   * Aplica todos los filtros activos
   */
  aplicarFiltros(resetPage: boolean = false) {
    if (this.isLoadingPasajes) return;
    
    // Si se resetea la página o es una nueva búsqueda, ir a la primera página
    if (resetPage) {
      this.currentPage = 0;
    }
    
    const filtro: FiltroPasajeViajeDto = {};
    
    // Filtro por estado
    const estado = this.estadoFilter.value;
    if (estado && estado !== 'todos') {
      filtro.estados = [estado as TipoEstadoPasaje];
    }
    
    // Filtro por fechas
    if (this.fechaDesdeFilter.value) {
      filtro.fechaDesde = this.fechaDesdeFilter.value.toISOString();
    }
    
    if (this.fechaHastaFilter.value) {
      filtro.fechaHasta = this.fechaHastaFilter.value.toISOString();
    }
    
    // Filtro por origen
    const origen = this.origenFilter.value;
    if (origen && origen !== 'todas') {
      filtro.origenId = parseInt(origen);
    }
    
    // Filtro por destino
    const destino = this.destinoFilter.value;
    if (destino && destino !== 'todas') {
      filtro.destinoId = parseInt(destino);
    }
    
    // Filtro por número de asiento
    const numeroAsiento = this.numeroAsientoFilter.value;
    if (numeroAsiento && numeroAsiento > 0 && this.numeroAsientoFilter.valid) {
      filtro.numeroAsiento = parseInt(numeroAsiento);
    }
    
    this.cargarPasajesConFiltro(filtro);
  }

  /**
   * Limpia todos los filtros
   */
  limpiarFiltros() {
    this.estadoFilter.setValue('todos');
    this.fechaDesdeFilter.setValue(null);
    this.fechaHastaFilter.setValue(null);
    this.origenFilter.setValue('todas');
    this.destinoFilter.setValue('todas');
    this.numeroAsientoFilter.setValue(null);
    this.currentPage = 0; // Resetear a la primera página
    this.cargarPasajes();
  }

  /**
   * Maneja el evento de cambio de página
   */
  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.aplicarFiltros();
  }

  /**
   * Recarga los pasajes con filtros del servidor
   */
  cargarPasajesConFiltro(filtro: FiltroPasajeViajeDto) {
    this.isLoadingPasajes = true;
    
    this.pasajeService.getPasajesPorViaje(this.data.viaje.id, filtro, this.currentPage, this.pageSize)
      .subscribe({
        next: (page) => {
          this.pasajes = page.content;
          this.pasajesFiltrados = [...this.pasajes];
          this.totalElements = page.page.totalElements;
          this.isLoadingPasajes = false;
        },
        error: (error) => {
          console.error('Error al cargar pasajes con filtro:', error);
          this.materialUtils.showError('Error al aplicar filtros');
          this.isLoadingPasajes = false;
          this.pasajes = [];
          this.pasajesFiltrados = [];
          this.totalElements = 0;
        }
      });
  }



  getEstadoText(estado: TipoEstadoPasaje): string {
    switch(estado) {
      case TipoEstadoPasaje.CONFIRMADO: return 'Confirmado';
      case TipoEstadoPasaje.PENDIENTE: return 'Pendiente';
      case TipoEstadoPasaje.CANCELADO: return 'Cancelado';
      case TipoEstadoPasaje.DEVUELTO: return 'Devuelto';
      default: return estado;
    }
  }

  getEstadoBadgeClass(estado: TipoEstadoPasaje): string {
    switch(estado) {
      case TipoEstadoPasaje.CONFIRMADO: return 'badge-confirmado';
      case TipoEstadoPasaje.PENDIENTE: return 'badge-pendiente';
      case TipoEstadoPasaje.CANCELADO: return 'badge-cancelado';
      case TipoEstadoPasaje.DEVUELTO: return 'badge-devuelto';
      default: return 'badge-default';
    }
  }

  /**
   * Abre el diálogo de detalle completo del pasaje
   */
  abrirDetallePasaje(pasaje: PasajeDto): void {
    const dialogRef = this.dialog.open(DetallePasajeCompletoDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { pasajeId: pasaje.id },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(() => {
      // Recargar la lista de pasajes para reflejar posibles cambios (como reembolsos)
      this.aplicarFiltros();
    });
  }



  /**
   * Busca pasajes aplicando los filtros activos
   */
  buscarPasajes() {
    // Verificar que no hay errores de validación
    if (this.numeroAsientoFilter.invalid) {
      this.materialUtils.showError('Corrige los errores en el número de asiento antes de buscar');
      return;
    }
    
    this.aplicarFiltros(true); // Resetear a la primera página en nueva búsqueda
  }

  /**
   * Verifica si hay errores de validación en los filtros
   */
  get tieneErroresValidacion(): boolean {
    return this.numeroAsientoFilter.invalid;
  }

  /**
   * TrackBy function para mejorar el rendimiento en la lista de paradas
   */
  trackByParadaId(index: number, parada: { id: number, nombre: string }): number {
    return parada.id;
  }

  /**
   * Obtiene todas las paradas disponibles para el filtro de origen
   */
  get paradasOrigen(): { id: number, nombre: string }[] {
    try {
      if (!this.data?.viaje?.paradas || this.data.viaje.paradas.length === 0) {
        return [];
      }
      
      return this.data.viaje.paradas.filter(parada => parada && parada.localidadId && parada.nombreLocalidad).map(parada => ({
        id: parada.localidadId,
        nombre: parada.nombreLocalidad
      }));
    } catch (error) {
      console.error('Error al obtener paradas origen:', error);
      return [];
    }
  }

  /**
   * Obtiene todas las paradas disponibles para el filtro de destino
   */
  get paradasDestino(): { id: number, nombre: string }[] {
    try {
      if (!this.data?.viaje?.paradas || this.data.viaje.paradas.length === 0) {
        return [];
      }
      
      return this.data.viaje.paradas.filter(parada => parada && parada.localidadId && parada.nombreLocalidad).map(parada => ({
        id: parada.localidadId,
        nombre: parada.nombreLocalidad
      }));
    } catch (error) {
      console.error('Error al obtener paradas destino:', error);
      return [];
    }
  }

  // Métodos para asientos
  getAsientosDisponibles(): AsientoDto[] {
    const asientos = this.data.viaje.asientos || [];
    return asientos.filter(a => a.estado === 'DISPONIBLE');
  }

  getAsientosConfirmados(): AsientoDto[] {
    const asientos = this.data.viaje.asientos || [];
    return asientos.filter(a => a.estado === 'CONFIRMADO');
  }

  getAsientosReservados(): AsientoDto[] {
    const asientos = this.data.viaje.asientos || [];
    return asientos.filter(a => a.estado === 'RESERVADO');
  }

  // Método obsoleto - mantener por compatibilidad pero usar getAsientosConfirmados
  getAsientosOcupados(): AsientoDto[] {
    return this.getAsientosConfirmados();
  }

  getEstadoAsiento(asiento: AsientoDto): string {
    switch(asiento.estado) {
      case 'DISPONIBLE': return 'disponible';
      case 'CONFIRMADO': return 'confirmado';
      case 'RESERVADO': return 'reservado';
      default: return 'disponible';
    }
  }

  // Métodos existentes actualizados con datos reales
  tieneParadas(): boolean {
    return this.data.viaje.paradas && this.data.viaje.paradas.length >= 2;
  }

  get pasajesDisponibles(): number {
    return this.data.viaje.cantidadAsientosDisponibles || 0;
  }

  get duracionViaje(): string {
    const salida = new Date(this.data.viaje.fechaHoraSalida);
    const llegada = new Date(this.data.viaje.fechaHoraLlegada);
    const diff = llegada.getTime() - salida.getTime();
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${horas}h ${minutos.toString().padStart(2, '0')}m`;
  }

  get porcentajeOcupacion(): number {
    if (this.data.viaje.cantidadPasajesVendibles === 0) return 0;
    return (this.data.viaje.cantidadAsientosVendidos / this.data.viaje.cantidadPasajesVendibles) * 100;
  }

  get ingresosGenerados(): number {
    return this.data.viaje.cantidadAsientosVendidos * this.data.viaje.precio;
  }

  get nombreOrigenSimple(): string {
    return this.data.viaje.nombreLocalidadOrigen;
  }

  get nombreDestinoSimple(): string {
    return this.data.viaje.nombreLocalidadDestino;
  }

  get cantidadMaximaAsientos(): number {
    return this.data.viaje.cantidadPasajesVendibles || 0;
  }

  cerrar() {
    this.dialogRef.close();
  }

  abrirReasignarOmnibus() {
    this.dialog.open(ReasignarOmnibusDialogComponent, {
      data: { viaje: this.data.viaje },
      width: '600px',
      disableClose: true
    }).afterClosed().subscribe(reasignado => {
      if (reasignado) this.dialogRef.close({ reasignado: true });
    });
  }

  get puedeReasignar(): boolean {
    // Verificar que el viaje no haya partido todavía
    const fechaHoraSalida = new Date(this.data.viaje.fechaHoraSalida);
    const ahora = new Date();
    return fechaHoraSalida > ahora;
  }

  // Método para organizar asientos en filas de autobús (2+2)
  getAsientosEnFilas(): { izquierda: AsientoDto[], derecha: AsientoDto[] }[] {
    const asientos = this.data.viaje.asientos || [];
    const filas: { izquierda: AsientoDto[], derecha: AsientoDto[] }[] = [];
    
    if (asientos.length === 0) {
      return filas;
    }

    const asientosOrdenados = [...asientos].sort((a, b) => a.numero - b.numero);
    
    // Organizamos en filas de 4 asientos (2 izquierda + 2 derecha)
    for (let i = 0; i < asientosOrdenados.length; i += 4) {
      const fila = {
        izquierda: asientosOrdenados.slice(i, i + 2),
        derecha: asientosOrdenados.slice(i + 2, i + 4)
      };
      
      // Solo agregamos la fila si tiene al menos un asiento
      if (fila.izquierda.length > 0 || fila.derecha.length > 0) {
        filas.push(fila);
      }
    }

    return filas;
  }

}
