import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {

  userId: number = 0;
  userRole: string = '';

  username: string = '';
  email: string = '';
  mobileNumber: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  loading: boolean = true;
  saving: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  passwordError: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.userRole = this.authService.getUserRole();

    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.authService.getUserProfile(this.userId).subscribe({
      next: (data: any) => {
        this.username = data.username || data.Username || '';
        this.email = data.email || data.Email || '';
        this.mobileNumber = data.mobileNumber || data.MobileNumber || '';
        this.loading = false;
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to load profile. Please try again.';
        this.loading = false;
      }
    });
  }

  onSave(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.passwordError = '';

    if (this.newPassword && this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Passwords do not match.';
      return;
    }

    const payload: any = {
      Username: this.username,
      MobileNumber: this.mobileNumber,
      Email: this.email,
      UserRole: this.userRole
    };

    if (this.newPassword) {
      payload.Password = this.newPassword;
    }

    this.saving = true;
    this.authService.updateUserProfile(this.userId, payload).subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = 'Profile updated successfully!';
        this.newPassword = '';
        this.confirmPassword = '';
        setTimeout(() => (this.successMessage = ''), 4000);
      },
      error: (err: any) => {
        this.saving = false;
        this.errorMessage = err?.error?.message || 'Failed to update profile. Please try again.';
      }
    });
  }

  goBack(): void {
    const route = this.userRole === 'Admin' ? '/admin/dashboard' : '/user/dashboard';
    this.router.navigate([route]);
  }
}
