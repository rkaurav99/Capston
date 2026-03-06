import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  @Input() showSidebar: boolean = false;
  @Output() sidebarCollapsedChange = new EventEmitter<boolean>();

  userRole: string = '';
  isLoggedIn: boolean = false;
  mobileMenuOpen: boolean = false;
  sidebarOpen: boolean = false;
  sidebarCollapsed: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    // Subscribe to role changes — Navbar updates reactively when user logs in/out
    this.authService.userRole$.subscribe((role: string) => {
      this.userRole = role;
      this.isLoggedIn = this.authService.isLoggedIn();
    });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleCollapsed(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this.sidebarCollapsedChange.emit(this.sidebarCollapsed);
  }

  goDashboard(): void {
    const role = this.authService.getUserRole();
    this.router.navigate([role === 'Admin' ? '/admin/dashboard' : '/user/dashboard']);
  }

  goEditProfile(): void {
    this.router.navigate(['/edit-profile']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
