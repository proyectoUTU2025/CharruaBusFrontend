import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { NotificacionDto, NotificacionUsuarioDto } from '../models/notificaciones';
import { ApiResponse } from '../models/api';
import { Page } from '../models/api';
import { AuthService } from './auth.service';
import { MaterialUtilsService } from '../shared/material-utils.service';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService implements OnDestroy {
  // Servicio de notificaciones exclusivo para usuarios CLIENTE
  private baseUrl = `${environment.apiBaseUrl}/notificaciones`;
  private eventSource: EventSource | null = null;
  private notificacionesSubject = new Subject<NotificacionDto>();
  private contadorNoLeidasSubject = new BehaviorSubject<number>(0);
  private conexionDeshabilitada = false;
  private estadoConexionSubject = new BehaviorSubject<'conectado' | 'desconectado' | 'error'>('desconectado');

  constructor(
    private http: HttpClient,
    private materialUtils: MaterialUtilsService,
    private authService: AuthService
  ) {}

  ngOnDestroy(): void {
    this.cerrarConexionSSE();
  }

  // Observable para nuevas notificaciones
  get notificaciones$(): Observable<NotificacionDto> {
    return this.notificacionesSubject.asObservable();
  }

  // Observable para contador de notificaciones no leídas
  get contadorNoLeidas$(): Observable<number> {
    return this.contadorNoLeidasSubject.asObservable();
  }

  // Observable para estado de conexión SSE
  get estadoConexion$(): Observable<'conectado' | 'desconectado' | 'error'> {
    return this.estadoConexionSubject.asObservable();
  }

  // Iniciar conexión SSE
  conectarSSE(clienteId: number): void {
    if (this.conexionDeshabilitada) {
      console.warn('Conexión SSE deshabilitada debido a errores previos');
      return;
    }

    // Verificar que el usuario esté autenticado
    if (!this.authService.isLoggedIn || !this.authService.token) {
      console.error('Usuario no autenticado, no se puede conectar SSE');
      this.estadoConexionSubject.next('error');
      return;
    }

    console.log('Iniciando conexión SSE para cliente:', clienteId);
    console.log('URL del servidor:', this.baseUrl);
    console.log('Usuario autenticado:', this.authService.email);
    
    // Conectar con token de autorización
    this.conectarSSEConReintentos(clienteId, 0);
  }



  // Intentar reconexión con backoff
  private intentarReconexion(clienteId: number, intentos: number = 0): void {
    if (intentos >= 3) {
      console.error('Máximo número de intentos de reconexión alcanzado');
      this.conexionDeshabilitada = true;
      this.estadoConexionSubject.next('error');
      this.mostrarErrorConexion();
      
      // Reactivar conexión después de 5 minutos
      setTimeout(() => {
        console.log('Reactivando conexión SSE después de pausa');
        this.conexionDeshabilitada = false;
        this.conectarSSE(clienteId);
      }, 300000); // 5 minutos
      
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, intentos), 30000); // Backoff exponencial, máximo 30 segundos
    console.log(`Reintentando conexión SSE en ${delay}ms (intento ${intentos + 1}/3)`);
    this.estadoConexionSubject.next('desconectado');
    
    setTimeout(() => {
      if (!this.eventSource || this.eventSource.readyState === EventSource.CLOSED) {
        console.log('Ejecutando reconexión SSE...');
        this.conectarSSEConReintentos(clienteId, intentos + 1);
      }
    }, delay);
  }

  // Conectar SSE con control de reintentos
  private conectarSSEConReintentos(clienteId: number, intentos: number = 0): void {
    // Incluir token de autorización en la URL como query parameter
    const token = this.authService.token;
    let url = `${this.baseUrl}/stream?clienteId=${clienteId}`;
    
    try {
      if (this.eventSource) {
        this.cerrarConexionSSE();
      }

      // Crear EventSource con configuración para enviar cookies
      this.eventSource = new EventSource(url);
      // Nota: EventSource no soporta withCredentials directamente, 
      // pero el token se envía como query parameter

      this.eventSource.onopen = (event) => {
        console.log('Conexión SSE establecida correctamente');
        this.estadoConexionSubject.next('conectado');
      };

      this.eventSource.onmessage = (event) => {
        try {
          const notificacion: NotificacionDto = JSON.parse(event.data);
          
          // Si no es el mensaje de conexión, procesarlo
          if (notificacion.titulo !== 'Conectado') {
            this.notificacionesSubject.next(notificacion);
            this.mostrarNotificacionToast(notificacion);
            
            // Actualizar contador de no leídas
            this.actualizarContadorNoLeidas(clienteId);
          }
        } catch (error) {
          console.error('Error al procesar notificación SSE:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('Error en conexión SSE:', error);
        console.log('Estado de la conexión:', this.eventSource?.readyState);
        console.log('URL utilizada:', url.replace(/token=[^&]+/, 'token=***'));
        
        // Actualizar estado inmediatamente
        this.estadoConexionSubject.next('error');
        
        // Verificar si es un error de autorización
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          console.log('Conexión SSE cerrada. Puede ser un error de autorización (401)');
          
          // Verificar si el token sigue válido
          if (!this.authService.isLoggedIn || !this.authService.token) {
            console.error('Token expirado o inválido, no se puede reconectar SSE');
            this.mostrarErrorAutorizacion();
            return;
          }
          
          console.log('Token válido, intentando reconectar...');
          this.intentarReconexion(clienteId, intentos);
        } else if (this.eventSource?.readyState === EventSource.CONNECTING) {
          console.log('Problema al conectar SSE, reintentando...');
          this.intentarReconexion(clienteId, intentos);
        }
      };
    } catch (error) {
      console.error('Error al crear EventSource:', error);
      this.mostrarErrorConexion();
    }
  }

  // Mostrar error de conexión al usuario
  private mostrarErrorConexion(): void {
    const mensaje = this.conexionDeshabilitada
      ? 'Notificaciones temporalmente deshabilitadas. Se reactivarán automáticamente en unos minutos.'
      : 'Problema de conexión con notificaciones. Algunas funciones pueden no estar disponibles.';

    this.materialUtils.showWarning(mensaje, { duration: 10000 });
  }

  // Mostrar error de autorización específico
  private mostrarErrorAutorizacion(): void {
    this.materialUtils.showError(
      'Error de autorización en notificaciones. Por favor, cierra sesión e inicia sesión nuevamente.',
      { duration: 15000 }
    );
  }

  // Cerrar conexión SSE
  cerrarConexionSSE(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.estadoConexionSubject.next('desconectado');
  }

  // Obtener estado actual de la conexión
  obtenerEstadoConexion(): 'conectado' | 'desconectado' | 'error' {
    return this.estadoConexionSubject.value;
  }

  // Forzar reconexión (para uso desde componentes)
  forzarReconexion(clienteId: number): void {
    console.log('Forzando reconexión SSE...');
    this.conexionDeshabilitada = false;
    this.cerrarConexionSSE();
    setTimeout(() => {
      this.conectarSSE(clienteId);
    }, 1000);
  }

  // Listar notificaciones paginadas
  listarNotificaciones(clienteId: number, page: number = 0, size: number = 10): Observable<Page<NotificacionUsuarioDto>> {
    const params = new HttpParams()
      .set('clienteId', clienteId.toString())
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<NotificacionUsuarioDto>>(this.baseUrl + '/all', { params })
      .pipe(
        map(response => {
          // Convertir strings de fecha a Date objects
          response.content = response.content.map(notif => ({
            ...notif,
            fecha: new Date(notif.fecha)
          }));
          return response;
        }),
        catchError(error => {
          console.error('Error al listar notificaciones:', error);
          this.materialUtils.showError('Error al cargar notificaciones');
          return of({ 
            content: [], 
            page: { 
              number: 0, 
              size: 0, 
              totalElements: 0, 
              totalPages: 0, 
              first: true, 
              last: true 
            } 
          } as Page<NotificacionUsuarioDto>);
        })
      );
  }

  // Contar notificaciones no leídas
  contarNoLeidas(clienteId: number): Observable<number> {
    const params = new HttpParams().set('clienteId', clienteId.toString());

    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/pendientes/count`, { params })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error al contar notificaciones no leídas:', error);
          return of(0);
        })
      );
  }

  // Marcar notificaciones como leídas
  marcarLeidas(clienteId: number): Observable<void> {
    const params = new HttpParams().set('clienteId', clienteId.toString());

    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/marcar-leidas`, null, { params })
      .pipe(
        map(() => {
          this.contadorNoLeidasSubject.next(0);
          this.materialUtils.showSuccess('Notificaciones marcadas como leídas', { duration: 2000 });
        }),
        catchError(error => {
          console.error('Error al marcar notificaciones como leídas:', error);
          this.materialUtils.showError('Error al marcar notificaciones como leídas');
          return of();
        })
      );
  }

  // Actualizar contador de notificaciones no leídas
  actualizarContadorNoLeidas(clienteId: number): void {
    console.log('Actualizando contador de no leídas para cliente:', clienteId);
    this.contarNoLeidas(clienteId).subscribe(count => {
      console.log('Contador recibido del servidor:', count);
      this.contadorNoLeidasSubject.next(count);
    });
  }

  // Mostrar notificación como toast
  private mostrarNotificacionToast(notificacion: NotificacionDto): void {
    this.materialUtils.showInfo(
      `${notificacion.titulo}: ${notificacion.mensaje}`,
      {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      }
    );
  }
} 