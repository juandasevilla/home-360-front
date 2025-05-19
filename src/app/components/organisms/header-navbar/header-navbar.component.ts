import { Component } from '@angular/core';

@Component({
  selector: 'app-header-navbar',
  templateUrl: './header-navbar.component.html',
  styleUrls: ['./header-navbar.component.scss']
})
export class HeaderNavbarComponent {
  logoSrc: string = 'assets/images/logo360.png';
  logoAlt: string = 'Hogar360';
  buttonText: string = 'Ingresar';
  buttonLink: string = '/login';

  navLinks: {text: string, url: string}[] = [
    { text: 'Compra', url: '/compra' },
    { text: 'Renta', url: '/renta' },
    { text: 'Vende', url: '/vende' }
  ];
}
