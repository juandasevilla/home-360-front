import { Component, OnInit } from '@angular/core';
import { 
  faGaugeHigh, // Para Dashboard
  faLayerGroup, // Para Categorías
  faBuilding, // Para Propiedades
  faUsers, // Para Usuarios
  faGear, // Para Configuración
  faLocationDot,
  faCalendar
} from '@fortawesome/free-solid-svg-icons';
import { SidebarMenuItem } from 'src/app/shared/models/SidebarMenuItem';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  private allMenuItems: SidebarMenuItem[] = [
    { icon: faGaugeHigh, title: 'Dashboard', route: '/admin/dashboard', roles: ['ADMIN'] },
    { icon: faLayerGroup, title: 'Categorías', route: '/admin/categories', roles: ['ADMIN'] },
    { icon: faBuilding, title: 'Propiedades', route: '/seller/real-state', roles: ['SELLER'] },
    { icon: faUsers, title: 'Usuarios', route: '/admin/users', roles: ['ADMIN'] },
    { icon: faGear, title: 'Configuración', route: '/admin/settings', roles: ['ADMIN'] },
    { icon: faLocationDot, title: 'Ubicación', route: '/admin/location', roles: ['ADMIN'] },
    { icon: faCalendar, title: 'Horario', route: '/seller/schedule', roles: ['SELLER'] },
  ];

  menuItems: SidebarMenuItem[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.filterMenuByRole();
  }

  private filterMenuByRole(): void {
    const userRole = this.authService.getUserRole();
    
    if (!userRole) {
      this.menuItems = [];
      return;
    }

    this.menuItems = this.allMenuItems.filter(item => 
      item.roles.includes(userRole)
    );
  }

}
