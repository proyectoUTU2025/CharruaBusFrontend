import { Routes } from '@angular/router';
import { SignupFormComponent } from './component/signup-form/signup-form.component';
import { SeatsComponent } from './component/seats/seats.component';
import { UsersPageComponent } from './component/users-page/users-page.component';
import { BusesPageComponent } from './component/buses-page/buses-page.component';
import { LocalidadesPageComponent } from './component/localidades-page/localidades-page.component';

export const routes: Routes = [
  { path: '', component: SignupFormComponent },
  { path: 'usuarios', component: UsersPageComponent },
  { path: 'omnibus', component: BusesPageComponent },
  { path: 'localidades', component: LocalidadesPageComponent },
  { path: '**', redirectTo: '' }
];
