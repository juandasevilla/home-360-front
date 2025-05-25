import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ButtonComponent } from './components/atoms/button/button.component';
import { InputComponent } from './components/atoms/input/input.component';
import { LabelComponent } from './components/atoms/label/label.component';
import { FooterComponent } from './components/molecules/footer/footer.component';
import { FooterContainerComponent } from './components/organisms/footer-container/footer-container.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NavbarComponent } from './components/molecules/navbar/navbar.component';
import { HeaderNavbarComponent } from './components/organisms/header-navbar/header-navbar.component';
import { SidebarItemComponent } from './components/molecules/sidebar-item/sidebar-item.component';
import { SidebarComponent } from './components/organisms/sidebar/sidebar.component';
import { AdminLayoutComponent } from './components/layouts/admin-layout/admin-layout.component';
import { CategoriesComponent } from './components/pages/admin/categories/categories.component';
import { DashboardComponent } from './components/pages/admin/dashboard/dashboard.component';
import { TextareaComponent } from './components/atoms/textarea/textarea.component';
import { FormFieldComponent } from './components/molecules/form-field/form-field.component';
import { CategoryFormComponent } from './components/organisms/category-form/category-form.component';
import { ReactiveFormsModule } from '@angular/forms';  
import { HttpClientModule } from '@angular/common/http';
import { DataTableComponent } from './components/molecules/data-table/data-table.component';
import { PaginationComponent } from './components/molecules/pagination/pagination.component';
import { CategoryTableComponent } from './components/organisms/category-table/category-table.component';
import { LocationsComponent } from './components/pages/admin/locations/locations.component';
import { LocationFormComponent } from './components/organisms/location-form/location-form.component';
import { LocationTableComponent } from './components/organisms/location-table/location-table.component';
import { UsersComponent } from './components/pages/admin/users/users.component';
import { UserFormComponent } from './components/organisms/user-form/user-form.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Añadir esto
import { ToastrModule } from 'ngx-toastr';
import { RealStateComponent } from './components/pages/real-state/real-state/real-state.component';
import { RealStateFormComponent } from './components/organisms/real-state-form/real-state-form.component'; 

@NgModule({
  declarations: [
    AppComponent,
    ButtonComponent,
    InputComponent,
    LabelComponent,
    FooterComponent,
    FooterContainerComponent,
    NavbarComponent,
    HeaderNavbarComponent,
    SidebarItemComponent,
    SidebarComponent,
    AdminLayoutComponent,
    CategoriesComponent,
    DashboardComponent,
    TextareaComponent,
    FormFieldComponent,
    CategoryFormComponent,
    DataTableComponent,
    PaginationComponent,
    CategoryTableComponent,
    LocationsComponent,
    LocationFormComponent,
    LocationTableComponent,
    UsersComponent,
    UserFormComponent,
    RealStateComponent,
    RealStateFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule, 
    ToastrModule.forRoot({
      timeOut: 5000,         // Tiempo que se muestra (ms)
      positionClass: 'toast-center-center', // Posición (hay varias opciones)
      preventDuplicates: true,          // Evitar mostrar el mismo mensaje varias veces
      closeButton: true,                // Mostrar botón de cerrar
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
