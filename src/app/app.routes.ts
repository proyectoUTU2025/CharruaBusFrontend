import { Routes } from '@angular/router';
import { LoginPageComponent } from './component/login-page/login-page.component';
import { SignupPageComponent } from './component/signup-page/signup-page.component';
import { VerificarCodigoComponent } from './component/signup-page/verificar-codigo/verificar-codigo.component';
import { ForgotPasswordComponent } from './component/forgot-password/forgot-password.component';
import { VerifyResetComponent } from './component/verify-reset/verify-reset.component';
import { ResetPasswordComponent } from './component/reset-password/reset-password.component';
import { CompraPageComponent } from './component/compra-page/compra-page.component';
import { StripeRedirectComponent } from './component/stripe-redirect.component/stripe-redirect.component';
import { UsersPageComponent } from './component/users-page/users-page.component';
import { BusesPageComponent } from './component/buses-page/buses-page.component';
import { LocalidadesPageComponent } from './component/localidades-page/localidades-page.component';
import { ViajesPageComponent } from './component/viajes-page/viajes-page.component';
import { ConfiguracionDelSistemaComponent } from './component/configuracion-del-sistema/configuracion-del-sistema.component';
import { AuthGuard } from './core/auth/auth.guard';
import { RoleGuard } from './core/auth/role.guard';
import { LoggedInGuard } from './core/auth/logged-in.guard';
import { BusDetailComponent } from './component/transport/buses-page/bus-detail/bus-detail.component';
import { ProfilePageComponent } from './component/profile-page/profile-page.component';
import { PasajeHistoryComponent } from './component/pasaje-history/pasaje-history.component';
import { UsuariosPorTipoComponent } from './component/estadisticas/usuario/usuarios-por-tipo/usuarios-por-tipo.component';
import { ComprasClientesComponent } from './component/estadisticas/usuario/compras-clientes/compras-clientes.component';
import { LogueosUsuariosComponent } from './component/estadisticas/usuario/logueos-usuarios/logueos-usuarios.component';
import { ViajesDepartamentoComponent } from './component/estadisticas/transporte/viajes-departamento/viajes-departamento.component';
import { ViajesPorOmnibusComponent } from './component/estadisticas/transporte/viajes-por-omnibus/viajes-por-omnibus.component';
import { MantenimientosPorOmnibusComponent } from './component/estadisticas/transporte/mantenimientos-por-omnibus/mantenimientos-por-omnibus.component';
import { EstadisticasPasajesComponent } from './component/estadisticas/transporte/estadisticas-pasajes/estadisticas-pasajes.component';
import { PasajesPorViajeComponent } from './component/pasajes-por-viaje/pasajes-por-viaje.component';
import { CompraDetallePageComponent } from './component/compra-detalle/compra-detalle-page.component';
import { LandingPageComponent } from './component/landing-page/landing-page.component';
import { NotFoundComponent } from './component/not-found/not-found.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
  // Landing page (pública) - redirige a /home si el usuario está logueado
  { path: '', component: LandingPageComponent, canActivate: [LoggedInGuard] },

  // Rutas de autenticación (sin navbar) - redirigen a /home si el usuario está logueado
  { path: 'login', component: LoginPageComponent, canActivate: [LoggedInGuard] },
  { path: 'signup', component: SignupPageComponent, canActivate: [LoggedInGuard] },
  { path: 'verificar-codigo', component: VerificarCodigoComponent, canActivate: [LoggedInGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [LoggedInGuard] },
  { path: 'verify-reset', component: VerifyResetComponent, canActivate: [LoggedInGuard] },
  { path: 'reset-password', component: ResetPasswordComponent, canActivate: [LoggedInGuard] },

  // Rutas de la aplicación principal (con navbar y protegidas)
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      
      // Rutas comunes para todos los usuarios logueados
      { path: 'home', loadComponent: () => import('./component/home-page/home-page.component').then(m => m.HomePageComponent) },
      { path: 'perfil', component: ProfilePageComponent },
      
      // Rutas específicas para ADMIN
      { path: 'usuarios', component: UsersPageComponent, canActivate: [RoleGuard], data: { roles: ['ADMIN'] } },
      { path: 'configuraciones', component: ConfiguracionDelSistemaComponent, canActivate: [RoleGuard], data: { roles: ['ADMIN'] } },
      
      // Rutas específicas para VENDEDOR
      { path: 'omnibus', component: BusesPageComponent, canActivate: [RoleGuard], data: { roles: ['VENDEDOR'] } },
      { path: 'omnibus/:id', component: BusDetailComponent, canActivate: [RoleGuard], data: { roles: ['VENDEDOR'] } },
      { path: 'localidades', component: LocalidadesPageComponent, canActivate: [RoleGuard], data: { roles: ['VENDEDOR'] } },
      { path: 'viajes', component: ViajesPageComponent, canActivate: [RoleGuard], data: { roles: ['VENDEDOR'] } },
      
      // Rutas compartidas VENDEDOR y CLIENTE
      { path: 'comprar', component: CompraPageComponent, canActivate: [RoleGuard], data: { roles: ['VENDEDOR', 'CLIENTE'] } },
      { path: 'compras/exito', component: StripeRedirectComponent, canActivate: [RoleGuard], data: { roles: ['VENDEDOR', 'CLIENTE'] } },
      { path: 'compras/cancelada', component: StripeRedirectComponent, canActivate: [RoleGuard], data: { roles: ['VENDEDOR', 'CLIENTE'] } },
      { path: 'compras/:id', component: CompraDetallePageComponent, canActivate: [RoleGuard], data: { roles: ['VENDEDOR', 'CLIENTE'] } },


      // Rutas específicas para CLIENTE
      { path: 'pasajes', component: PasajeHistoryComponent, canActivate: [RoleGuard], data: { roles: ['CLIENTE'] } },
      
      // Estadísticas para ADMIN
      { path: 'estadisticas/usuarios-por-tipo', component: UsuariosPorTipoComponent, canActivate: [RoleGuard], data: { roles: ['ADMIN'] } },
      { path: 'estadisticas/compras-clientes', component: ComprasClientesComponent, canActivate: [RoleGuard], data: { roles: ['ADMIN'] } },
      { path: 'estadisticas/logueos-usuarios', component: LogueosUsuariosComponent, canActivate: [RoleGuard], data: { roles: ['ADMIN'] } },
      
      // Estadísticas para VENDEDOR
      { path: 'estadisticas/viajes-departamento', component: ViajesDepartamentoComponent, canActivate: [RoleGuard], data: { roles: ['VENDEDOR'] } },
      { path: 'estadisticas/viajes-por-omnibus', component: ViajesPorOmnibusComponent, canActivate: [RoleGuard], data: { roles: ['VENDEDOR'] } },
      { path: 'estadisticas/mantenimientos-por-omnibus', component: MantenimientosPorOmnibusComponent, canActivate: [RoleGuard], data: { roles: ['VENDEDOR'] } },
      { path: 'estadisticas/estadisticas-pasajes', component: EstadisticasPasajesComponent, canActivate: [RoleGuard], data: { roles: ['VENDEDOR'] } },
    ]
  },

  // Página 404 específica para acceso sin permisos
  { path: 'not-found', component: NotFoundComponent },

  // Wildcard route para URLs realmente inexistentes
  { path: '**', component: NotFoundComponent }
];
