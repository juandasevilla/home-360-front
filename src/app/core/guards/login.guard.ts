import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const loginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    const userRole = authService.getUserRole();

    if (userRole === 'ADMIN') {
      router.navigate(['/admin/dashboard']);
    } else if (userRole === 'SELLER') {
      router.navigate(['/seller/dashboard']);
    } else {
      router.navigate(['/home']);
    }
    return false; // Prevent navigation to the login page if already authenticated
  }

  return true; // Allow navigation to the login page if not authenticated
};
