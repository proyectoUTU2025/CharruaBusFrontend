import { Routes } from '@angular/router';
import { LoginPageComponent } from './component/auth/login-page/login-page.component';
import { SignupPageComponent } from './component/auth/signup-page/signup-page.component';
import { VerifyResetCodeComponent } from './component/auth/verify-reset-code-page/verify-reset-code.component';

import { UsersPageComponent } from './component/user/users-page/users-page.component';
import { BusesPageComponent } from './component/transport/buses-page/buses-page.component';
import { LocalidadesPageComponent } from './component/transport/localidades-page/localidades-page.component';
import { ViajesPageComponent } from './component/transport/viajes-page/viajes-page.component';
import { BusDetailComponent } from './component/transport/buses-page/bus-detail/bus-detail.component';
import { ChangePasswordComponent } from './component/auth/change-password-page/change-password.component';
import { ProfilePageComponent } from './component/user/profile-page/profile-page.component';
import { ResetPasswordComponent } from './component/auth/reset-password-page/reset-password.component';
import { MisPasajesComponent } from './component/ticket/mis-pasajes-page/mis-pasajes.component';
import { ForgotPasswordComponent } from './component/auth/forgot-password-page/forgot-password.component';

export const routes: Routes = [
  { path: '', redirectTo: '/omnibus', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent },
  { path: 'verify-reset-code', component: VerifyResetCodeComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'registro', component: SignupPageComponent },

  { path: 'usuarios', component: UsersPageComponent },
  { path: 'omnibus/:id', component: BusDetailComponent },
  { path: 'omnibus', component: BusesPageComponent },
  { path: 'localidades', component: LocalidadesPageComponent },
  { path: 'viajes', component: ViajesPageComponent },
  { path: 'perfil/historial', component: ProfilePageComponent },
  { path: 'mis-pasajes', component: MisPasajesComponent },
  { path: 'change-password', component: ChangePasswordComponent },
  { path: 'restablecer-contrasenia', component: ResetPasswordComponent },


  
  { path: '**', redirectTo: '' }
];
