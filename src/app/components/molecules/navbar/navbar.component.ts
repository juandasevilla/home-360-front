import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

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

  @Input() isLoggedIn: boolean = false;
  @Input() userRole: string = '';
  @Input() showDropdown: boolean = false;
  ;
  
  @Input() navLinks: {text: string, url: string}[] = [
    { text: 'Compra', url: '/compra' },
    { text: 'Renta', url: '/renta' },
    { text: 'Vende', url: '/vende' }
  ];

  @Output() logoutClicked = new EventEmitter<void>()

  constructor(private router: Router) {}
  
  onButtonClick() {
    this.router.navigate([this.buttonLink]);
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  onLogout() {
    this.showDropdown = false;
    this.logoutClicked.emit();
  }

  
  closeDropdown() {
    this.showDropdown = false;
  }
}
