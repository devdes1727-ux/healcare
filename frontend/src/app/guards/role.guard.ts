import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function roleGuard(expectedRole: string): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const role = authService.getRole();

    if (role === expectedRole) {
      return true;
    }

    // Redirect to correct dashboard
    if (role === 'doctor') {
      router.navigate(['/doctor-dashboard']);
    } else if (role === 'patient') {
      router.navigate(['/patient-dashboard']);
    } else {
      router.navigate(['/login']);
    }
    return false;
  };
}
