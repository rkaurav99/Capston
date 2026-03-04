import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * AuthGuard prevents unauthenticated users from accessing protected routes.
 *
 * How it works:
 * 1. Angular calls canActivate() BEFORE loading a protected route
 * 2. If the user has a JWT token → returns true → route loads normally
 * 3. If no token → redirects to /login → returns false → route is blocked
 *
 * Usage in app-routing.module.ts:
 *   { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] }
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    }

    // Not logged in — redirect to login page
    this.router.navigate(['/login']);
    return false;
  }
}
