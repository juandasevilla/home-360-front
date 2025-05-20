import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Input() logoSrc: string = 'assets/images/logo360.png';
  @Input() logoAlt: string = 'Hogar360';
  @Input() buttonText: string = 'Ingresar';
  @Input() buttonLink: string = '/login';
  
  @Input() navLinks: {text: string, url: string}[] = [
    { text: 'Compra', url: '/compra' },
    { text: 'Renta', url: '/renta' },
    { text: 'Vende', url: '/vende' }
  ];
  
  onButtonClick() {
    // Puedes implementar navegación o acción del botón
  }
}
