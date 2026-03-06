import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Login } from '../../models/login.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  login: Login = new Login();
  errorMessage: string = '';
  loading: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    // If already logged in, redirect to appropriate dashboard
    if (this.authService.isLoggedIn()) {
      this.redirectByRole(this.authService.getUserRole());
    }
  }

  onLogin(): void {
    this.errorMessage = '';
    this.loading = true;

    this.authService.login(this.login).subscribe(
      (response: any) => {
        this.loading = false;
        const role = this.authService.getUserRole();
        this.redirectByRole(role);
      },
      (error) => {
        this.loading = false;
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Login failed. Please check your credentials.';
        }
      }
    );
  }

  private redirectByRole(role: string): void {
    if (role === 'Admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/user/dashboard']);
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
