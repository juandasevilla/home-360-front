import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-forbidden-page',
  templateUrl: './forbidden-page.component.html',
  styleUrls: ['./forbidden-page.component.scss']
})
export class ForbiddenPageComponent {
  constructor(
    private location: Location,
    private router: Router,
    private authService: AuthService
  ) {}

  goBack(): void {
    this.location.back();
  }

  goToHome(): void {
    const userRole = this.authService.getUserRole();
    
    if (userRole === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    } else if (userRole === 'SELLER') {
      this.router.navigate(['/seller/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
