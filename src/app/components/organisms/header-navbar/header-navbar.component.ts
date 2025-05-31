import { Component } from '@angular/core';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Router } from '@angular/router';

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

  isLoggedIn: boolean = false; // Cambiar a true para probar el diseño
  userRole: string = '';

  navLinks: {text: string, url: string}[] = [
    { text: 'Compra', url: '/compra' },
    { text: 'Renta', url: '/renta' },
    { text: 'Vende', url: '/vende' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.userRole = this.isLoggedIn ? this.authService.getUserRole() : '';
  }

  onLogout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.userRole = '';
    this.router.navigate(['/login']);
  }
}
