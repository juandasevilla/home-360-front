import { Component } from '@angular/core';
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

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  menuItems: SidebarMenuItem[] = [
    { icon: faGaugeHigh, title: 'Dashboard', route: '/admin/dashboard' },
    { icon: faLayerGroup, title: 'Categorías', route: '/admin/categories' },
    { icon: faBuilding, title: 'Propiedades', route: '/seller/real-state' },
    { icon: faUsers, title: 'Usuarios', route: '/admin/users' },
    { icon: faGear, title: 'Configuración', route: '/admin/settings' },
    { icon: faLocationDot, title: 'Ubicación', route: '/admin/location' },
    { icon: faCalendar, title: 'Horario', route: '/seller/schedule' }
  ];

}
