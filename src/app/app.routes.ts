import { Routes } from '@angular/router';
import { LoginPageComponent } from './component/login-page/login-page.component';
import { SignupPageComponent } from './component/signup-page/signup-page.component';
import { VerificarCodigoComponent } from './component/signup-page/verificar-codigo/verificar-codigo.component';
import { ForgotPasswordComponent } from './component/forgot-password/forgot-password.component';
import { VerifyResetComponent } from './component/verify-reset/verify-reset.component';
import { ResetPasswordComponent } from './component/reset-password/reset-password.component';
import { UsersPageComponent } from './component/users-page/users-page.component';
import { BusesPageComponent } from './component/buses-page/buses-page.component';
import { LocalidadesPageComponent } from './component/localidades-page/localidades-page.component';
import { ViajesPageComponent } from './component/viajes-page/viajes-page.component';
import { CompraPageComponent } from './component/compra-page/compra-page.component';
import { ProfilePageComponent } from './component/profile-page/profile-page.component';
import { PasajeHistoryComponent } from './component/pasaje-history/pasaje-history.component';
import { ChangePasswordComponent } from './component/change-password/change-password.component';
import { AuthGuard } from './core/auth/auth.guard';

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
      { path: '', component: UsersPageComponent, pathMatch: 'full' },
      { path: 'omnibus', component: BusesPageComponent },
      { path: 'localidades', component: LocalidadesPageComponent },
      { path: 'viajes', component: ViajesPageComponent },
      { path: 'comprar', component: CompraPageComponent },
      { path: 'perfil', component: ProfilePageComponent },
      { path: 'pasajes', component: PasajeHistoryComponent },
      { path: 'change-password', component: ChangePasswordComponent },
    ]
  },

  { path: '**', redirectTo: '' }
];
