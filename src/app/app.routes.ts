import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login-page/login-page.component';
import { MedicoDashboardComponent } from './components/doctor-view/doctor-view.component';
import { MedicoAgendaComponent } from './components/doctor-schedule/doctor-schedule.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'medico/:id', component: MedicoDashboardComponent },
  { path: 'medico/:id/agenda', component: MedicoAgendaComponent},
];
