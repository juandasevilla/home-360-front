import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/layouts/admin-layout/admin-layout.component';
import { DashboardComponent } from './components/pages/admin/dashboard/dashboard.component';
import { CategoriesComponent } from './components/pages/admin/categories/categories.component';
import { LocationsComponent } from './components/pages/admin/locations/locations.component';
import { UsersComponent } from './components/pages/admin/users/users.component';
import { RealStateComponent } from './components/pages/real-state/real-state/real-state.component';
import { LoginComponent } from './components/pages/login/login.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent},

  // Rutas de administración
  {
    path: 'admin',
    component: AdminLayoutComponent,
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
    children: [
      {path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {path: 'dashboard', component: DashboardComponent },
      {path: 'real-state', component: RealStateComponent },
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
