import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const requiredRoles = route.data['roles'] as string[];

  const userRole = authService.getUserRole();

  if (!requiredRoles || requiredRoles.includes(userRole)) {
    return true;
  }

  router.navigate(['/forbidden']);
  return false;
};
