import { Routes } from '@angular/router';
import { SignupFormComponent } from './component/signup-form/signup-form.component';
import { SeatsComponent } from './component/seats/seats.component';
import { UsersPageComponent } from './component/users-page/users-page.component';
import { BusesPageComponent } from './component/buses-page/buses-page.component';
import { LocalidadesPageComponent } from './component/localidades-page/localidades-page.component';
import { ViajesPageComponent } from './component/viajes-page/viajes-page.component';
import { VerificarCodigoComponent } from './component/signup-form/verificar-codigo/verificar-codigo.component';

export const routes: Routes = [
  { path: '', component: UsersPageComponent },
  { path: 'login', component: SignupFormComponent },
  { path: 'omnibus', component: BusesPageComponent },
  { path: 'localidades', component: LocalidadesPageComponent },
  { path: 'viajes', component: ViajesPageComponent },
  { path: 'verificar-codigo', component: VerificarCodigoComponent },
  { path: '**', redirectTo: '' }
];
