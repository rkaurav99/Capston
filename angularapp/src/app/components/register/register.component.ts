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

  user: User = new User();
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';
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
}
