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
import { BusDetailComponent } from './component/transport/buses-page/bus-detail/bus-detail.component';
import { ProfilePageComponent } from './component/profile-page/profile-page.component';
import { PasajeHistoryComponent } from './component/pasaje-history/pasaje-history.component';
import { ChangePasswordComponent } from './component/change-password/change-password.component';
import { EditUserDialogComponent } from './component/users-page/dialogs/edit-user-dialog/edit-user-dialog.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'registro', component: SignupPageComponent },
  { path: 'verificar-codigo', component: VerificarCodigoComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'verify-reset', component: VerifyResetComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: CompraPageComponent },
      { path: 'configuracion', component: ConfiguracionDelSistemaComponent },
      { path: 'usuarios', component: UsersPageComponent, pathMatch: 'full' },
      { path: 'omnibus', component: BusesPageComponent },
      { path: 'omnibus/:id', component: BusDetailComponent },
      { path: 'localidades', component: LocalidadesPageComponent },
      { path: 'viajes', component: ViajesPageComponent },
      { path: 'compras/exito', component: StripeRedirectComponent },
      { path: 'compras/cancelada', component: StripeRedirectComponent },
      { path: 'comprar', component: CompraPageComponent },
      { path: 'perfil', component: ProfilePageComponent },
      { path: 'perfil/editar', component: EditUserDialogComponent },
      { path: 'pasajes', component: PasajeHistoryComponent },
      { path: 'change-password', component: ChangePasswordComponent },
    ]
  },

  { path: '**', redirectTo: '' }
];
