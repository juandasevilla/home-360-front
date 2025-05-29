import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/layouts/admin-layout/admin-layout.component';
import { DashboardComponent } from './components/pages/admin/dashboard/dashboard.component';
import { CategoriesComponent } from './components/pages/admin/categories/categories.component';
import { LocationsComponent } from './components/pages/admin/locations/locations.component';
import { UsersComponent } from './components/pages/admin/users/users.component';
import { RealStateComponent } from './components/pages/real-state/real-state/real-state.component';
import { LoginComponent } from './components/pages/login/login.component';
import { ScheduleComponent } from './components/pages/schedule/schedule.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { ForbiddenPageComponent } from './components/pages/forbidden-page/forbidden-page.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent},
  { path: 'forbidden', component: ForbiddenPageComponent },

  // Rutas de administración
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }, // Asegúrate de que el guardia de roles esté configurado para manejar esto 
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'location', component: LocationsComponent }, 
      { path: 'users', component: UsersComponent },
      //{ path: 'properties', component: PropertiesComponent },
      //{ path: 'settings', component: SettingsComponent }
    ]
  },

  {
    path: 'seller',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SELLER'] }, 
    children: [
      {path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {path: 'dashboard', component: DashboardComponent },
      {path: 'real-state', component: RealStateComponent },
      {path: 'schedule', component: ScheduleComponent },
    ]
  },
  
  // Ruta de fallback
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
