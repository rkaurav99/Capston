import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  private readonly ADMIN_SECRET_KEY = 'LTM2025';
  user: User = new User();
  confirmPassword: string = '';
  confirmPasswordError: string = '';
  roleError: string = '';
  secretKeyError: string = '';
  isRoleMenuOpen: boolean = false;
  showPassword = false;
  showConfirmPassword = false;
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.confirmPasswordError = '';
    this.roleError = '';
    this.secretKeyError = '';

    if (!this.user.UserRole || this.user.UserRole.trim().length === 0) {
      this.roleError = 'Please select a role.';
      return;
    }

    if (this.user.Password !== this.confirmPassword) {
      this.confirmPasswordError = 'Passwords do not match.';
      return;
    }

    if (this.isAdminRole()) {
      if (!this.user.SecretKey || this.user.SecretKey.trim().length === 0) {
        this.secretKeyError = 'Secret key is required for Admin registration.';
        return;
      }
      if (this.user.SecretKey.trim() !== this.ADMIN_SECRET_KEY) {
        this.secretKeyError = 'Invalid Admin secret key.';
        return;
      }
    } else {
      this.user.SecretKey = '';
    }

    this.loading = true;

    this.authService.register(this.user).subscribe(
      (response: any) => {
        this.loading = false;
        this.successMessage = response.message || 'Registration successful! Please login.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      (error) => {
        this.loading = false;
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else if (typeof error.error === 'string') {
          this.errorMessage = error.error;
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      }
    );
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  isAdminRole(): boolean {
    return this.user.UserRole === 'Admin';
  }

  onRoleChange(): void {
    this.roleError = '';
    this.secretKeyError = '';
    if (!this.isAdminRole()) {
      this.user.SecretKey = '';
    }
  }

  toggleRoleMenu(): void {
    this.isRoleMenuOpen = !this.isRoleMenuOpen;
  }

  selectRole(role: 'User' | 'Admin'): void {
    this.user.UserRole = role;
    this.isRoleMenuOpen = false;
    this.onRoleChange();
  }
}
