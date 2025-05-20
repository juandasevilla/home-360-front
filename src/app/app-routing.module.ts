import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/layouts/admin-layout/admin-layout.component';
import { DashboardComponent } from './components/pages/admin/dashboard/dashboard.component';
import { CategoriesComponent } from './components/pages/admin/categories/categories.component';

const routes: Routes = [
  
  // Rutas de administración
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'categories', component: CategoriesComponent },
      //{ path: 'properties', component: PropertiesComponent },
      //{ path: 'users', component: UsersComponent },
      //{ path: 'settings', component: SettingsComponent }
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
