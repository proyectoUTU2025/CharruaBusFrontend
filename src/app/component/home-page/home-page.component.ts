import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatGridListModule
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  userName: string | null = null;
  userRole: string | null = null;
  quickActions: any[] = [];
  currentTime: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userName = this.authService.nombre;
    this.userRole = this.authService.rol;
    this.updateTime();
    this.setupQuickActions();
    
    // Actualizar la hora cada minuto
    setInterval(() => this.updateTime(), 60000);
  }

  private updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleString('es-UY', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private setupQuickActions() {
    if (this.userRole === 'ADMIN') {
      this.quickActions = [
        { title: 'Gestionar Usuarios', icon: 'people', route: '/usuarios', color: '#1976d2', description: 'Administrar usuarios del sistema' },
        { title: 'Configuraciones', icon: 'settings', route: '/configuraciones', color: '#5d4037', description: 'Configurar parámetros del sistema' },
        { title: 'Mi Perfil', icon: 'person', route: '/perfil', color: '#455a64', description: 'Ver y editar mi perfil' },
        { title: 'Estadísticas de Usuarios', icon: 'bar_chart', route: '/estadisticas/usuarios-por-tipo', color: '#c2185b', description: 'Ver estadísticas de los usuarios del sistema' },
        { title: 'Estadísticas de Compras', icon: 'bar_chart', route: '/estadisticas/compras-clientes', color: '#c2185b', description: 'Ver estadísticas de las compras de los clientes' },
        { title: 'Estadísticas de Logueos', icon: 'bar_chart', route: '/estadisticas/logueos-usuarios', color: '#c2185b', description: 'Ver estadísticas de los ingresos de usuarios al sistema' },

      ];
    } else if (this.userRole === 'VENDEDOR') {
      this.quickActions = [
        { title: 'Gestionar Ómnibus', icon: 'directions_bus', route: '/omnibus', color: '#2e7d32', description: 'Administrar flota de ómnibus' },
        { title: 'Localidades', icon: 'location_city', route: '/localidades', color: '#7b1fa2', description: 'Gestionar localidades' },
        { title: 'Mi Perfil', icon: 'person', route: '/perfil', color: '#455a64', description: 'Ver y editar mi perfil' },
        { title: 'Gestionar Viajes', icon: 'event', route: '/viajes', color: '#f57c00', description: 'Administrar viajes y rutas' },
        { title: 'Vender Pasajes', icon: 'shopping_cart', route: '/comprar', color: '#1976d2', description: 'Vender pasajes a clientes' },
        { title: 'Estadísticas de Viajes', icon: 'bar_chart', route: '/estadisticas/viajes-departamento', color: '#c2185b', description: 'Ver estadísticas de viajes por departamento' },
        { title: 'Estadísticas de Ómnibus', icon: 'bar_chart', route: '/estadisticas/viajes-por-omnibus', color: '#c2185b', description: 'Ver estadísticas de viajes por ómnibus' },
        { title: 'Estadísticas de Mantenimiento', icon: 'bar_chart', route: '/estadisticas/mantenimientos-por-omnibus', color: '#c2185b', description: 'Ver estadísticas de mantenimiento de ómnibus' },
        { title: 'Estadísticas de Pasajes', icon: 'bar_chart', route: '/estadisticas/estadisticas-pasajes', color: '#c2185b', description: 'Ver estadísticas de pasajes comprados' }
      ];
    } else {
      // CLIENTE
      this.quickActions = [
        { title: 'Comprar Pasajes', icon: 'shopping_cart', route: '/comprar', color: '#1976d2', description: 'Comprar pasajes de ómnibus' },
        { title: 'Mis Pasajes', icon: 'history', route: '/pasajes', color: '#2e7d32', description: 'Ver historial de pasajes' },
        { title: 'Mis Compras', icon: 'history', route: '/compras', color: '#2e7d32', description: 'Ver historial de compras' },
        { title: 'Mi Perfil', icon: 'person', route: '/perfil', color: '#455a64', description: 'Ver y editar mi perfil' }
      ];
    }
  }

  getRoleDisplayName(): string {
    switch (this.userRole) {
      case 'ADMIN': return 'Administrador';
      case 'VENDEDOR': return 'Vendedor';
      case 'CLIENTE': return 'Cliente';
      default: return 'Usuario';
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
