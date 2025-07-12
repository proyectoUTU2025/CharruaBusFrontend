import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { NotificacionService } from '../../../services/notificacion.service';
import { AuthService } from '../../../services/auth.service';
import { NotificacionUsuarioDto } from '../../../models/notificaciones';
import { Page } from '../../../models/api';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.scss']
})
export class NotificacionesComponent implements OnInit, OnDestroy {
  contadorNoLeidas = 0;
  notificaciones: NotificacionUsuarioDto[] = [];
  cargando = false;
  cargandoMas = false;
  clienteId: number | null = null;
  paginaActual = 0;
  tamañoPagina = 5;
  hayMasNotificaciones = true;
  totalNotificaciones = 0;
  private subscriptions: Subscription[] = [];

  constructor(
    private notificacionService: NotificacionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn && this.authService.id && this.authService.rol === 'CLIENTE') {
      this.clienteId = this.authService.id;
      this.inicializarNotificaciones();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.notificacionService.cerrarConexionSSE();
  }

  private inicializarNotificaciones(): void {
    if (!this.clienteId) return;

    const contadorSub = this.notificacionService.contadorNoLeidas$.subscribe(
      count => {
        console.log('Contador no leídas actualizado:', count);
        this.contadorNoLeidas = count;
      }
    );
    this.subscriptions.push(contadorSub);

    // Cargar contador inicial
    this.notificacionService.actualizarContadorNoLeidas(this.clienteId);

    // Iniciar conexión SSE
    this.notificacionService.conectarSSE(this.clienteId);
  }

  abrirNotificaciones(): void {
    if (!this.clienteId) return;

    this.paginaActual = 0;
    this.notificaciones = [];
    this.hayMasNotificaciones = true;
    
    this.marcarTodasLeidas();
    this.cargarNotificaciones();
  }

  private cargarNotificaciones(): void {
    if (!this.clienteId || this.cargando || this.cargandoMas) return;

    if (this.paginaActual === 0) {
      this.cargando = true;
    } else {
      this.cargandoMas = true;
    }

    this.notificacionService.listarNotificaciones(this.clienteId, this.paginaActual, this.tamañoPagina).subscribe({
      next: (page: Page<NotificacionUsuarioDto>) => {
        if (this.paginaActual === 0) {
          this.notificaciones = page.content;
        } else {
          this.notificaciones = [...this.notificaciones, ...page.content];
        }
        
        this.totalNotificaciones = page.page.totalElements;
        this.hayMasNotificaciones = page.content.length === this.tamañoPagina && 
                                  this.notificaciones.length < this.totalNotificaciones;
        
        if (this.paginaActual === 0) {
          const noLeidasLocales = this.notificaciones.filter(n => !n.leido).length;
          console.log('Notificaciones no leídas encontradas localmente:', noLeidasLocales);
          console.log('Contador actual del servicio:', this.contadorNoLeidas);
          
          if (this.contadorNoLeidas === 0 && noLeidasLocales > 0) {
            console.log('Actualizando contador basándose en notificaciones locales');
            this.contadorNoLeidas = noLeidasLocales;
          }
        }
        
        this.cargando = false;
        this.cargandoMas = false;
      },
      error: (error) => {
        console.error('Error al cargar notificaciones:', error);
        this.cargando = false;
        this.cargandoMas = false;
      }
    });
  }

  cargarMasNotificaciones(): void {
    if (!this.hayMasNotificaciones || this.cargandoMas) return;
    
    this.paginaActual++;
    this.cargarNotificaciones();
  }

  marcarTodasLeidas(): void {
    if (!this.clienteId) return;

    const tieneNoLeidasLocales = this.notificaciones.some(n => !n.leido);
    if (this.contadorNoLeidas === 0 && !tieneNoLeidasLocales) {
      return;
    }

    this.notificacionService.marcarLeidas(this.clienteId).subscribe({
      next: () => {
        this.notificaciones = this.notificaciones.map(notif => ({
          ...notif,
          leido: true
        }));
        
        this.contadorNoLeidas = 0;
      },
      error: (error) => {
        console.error('Error al marcar notificaciones como leídas:', error);
      }
    });
  }

  formatearFecha(fecha: Date): string {
    const ahora = new Date();
    const diff = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return 'Hace un momento';
    if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    if (dias < 7) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
    
    return fecha.toLocaleDateString();
  }

  get mostrarBadge(): boolean {
    return this.contadorNoLeidas > 0;
  }

  get badgeContent(): string {
    return this.contadorNoLeidas > 99 ? '99+' : this.contadorNoLeidas.toString();
  }

  get esCliente(): boolean {
    return this.authService.rol === 'CLIENTE';
  }

  get hayNotificacionesNoLeidas(): boolean {
    return this.contadorNoLeidas > 0 || this.notificaciones.some(n => !n.leido);
  }

  trackByNotificacion(index: number, notificacion: NotificacionUsuarioDto): number {
    return notificacion.id;
  }
} 