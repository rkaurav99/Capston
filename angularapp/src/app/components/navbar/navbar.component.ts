import { Component, Input, Output, EventEmitter, OnDestroy, OnInit, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { NotificationItem } from '../../models/notification.model';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  @Input() showSidebar: boolean = false;
  @Output() sidebarCollapsedChange = new EventEmitter<boolean>();

  userRole: string = '';
  isLoggedIn: boolean = false;
  mobileMenuOpen: boolean = false;
  sidebarOpen: boolean = false;
  sidebarCollapsed: boolean = false;
  notificationOpen: boolean = false;
  isDashboardRoute: boolean = false;
  notifications: NotificationItem[] = [];
  unreadCount: number = 0;
  private roleSubscription?: Subscription;
  private routeSubscription?: Subscription;
  private unreadPollingId?: number;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isDashboardRoute = this.checkIsDashboardRoute(this.router.url);

    // Subscribe to role changes so navbar reacts to login/logout role transitions.
    this.roleSubscription = this.authService.userRole$.subscribe((role: string) => {
      this.userRole = role;
      this.isLoggedIn = this.authService.isLoggedIn();

      if (this.isLoggedIn) {
        this.loadNotifications();
      } else {
        this.notifications = [];
        this.unreadCount = 0;
      }
    });

    this.unreadPollingId = window.setInterval(() => {
      if (this.isLoggedIn) {
        this.loadUnreadCount();
      }
    }, 30000);

    this.routeSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const nav = event as NavigationEnd;
        this.isDashboardRoute = this.checkIsDashboardRoute(nav.urlAfterRedirects || nav.url);
        this.mobileMenuOpen = false;
        this.notificationOpen = false;
      });
  }

  ngOnDestroy(): void {
    this.roleSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
    if (this.unreadPollingId) {
      window.clearInterval(this.unreadPollingId);
    }
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

  goHome(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
      return;
    }

    this.goDashboard();
  }

  goDashboard(): void {
    const role = this.authService.getUserRole();
    this.router.navigate([role === 'Admin' ? '/admin/dashboard' : '/user/dashboard']);
  }

  goEditProfile(): void {
    this.router.navigate(['/edit-profile']);
  }

  logout(): void {
    if (!confirm('Are you sure you want to sign out?')) {
      return;
    }
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleNotifications(event?: MouseEvent): void {
    event?.stopPropagation();
    this.notificationOpen = !this.notificationOpen;
    if (this.notificationOpen) {
      this.loadNotifications();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Element | null;
    if (!target || !target.closest('.notif-wrap')) {
      this.notificationOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.notificationOpen = false;
    this.mobileMenuOpen = false;
  }

  loadNotifications(): void {
    this.notificationService.getMyNotifications().subscribe(
      (items: NotificationItem[]) => {
        this.notifications = items;
        this.unreadCount = items.filter(x => !x.IsRead).length;
      },
      () => {}
    );
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe(
      (data) => this.unreadCount = data.unreadCount,
      () => {}
    );
  }

  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe(
      () => this.loadNotifications(),
      () => {}
    );
  }

  onNotificationClick(notification: NotificationItem, event?: MouseEvent): void {
    event?.stopPropagation();

    const navigate = () => {
      const target = this.getNotificationTarget(notification);
      if (target) {
        this.router.navigate([target]);
      }
      this.notificationOpen = false;
    };

    if (!notification.IsRead) {
      this.notificationService.markAsRead(notification.NotificationId).subscribe(
        () => {
          this.unreadCount = Math.max(0, this.unreadCount - 1);
          navigate();
        },
        () => navigate()
      );
      return;
    }

    navigate();
  }

  private getNotificationTarget(notification: NotificationItem): string {
    const type = (notification.Type || '').toLowerCase();
    const isAdmin = this.userRole === 'Admin';

    if (type === 'security') {
      return '/edit-profile';
    }

    if (type === 'booking' || type === 'adminactivity' || type === 'reminder') {
      return isAdmin ? '/admin/bookings' : '/user/my-bookings';
    }

    if (type === 'waitlist') {
      return isAdmin ? '/admin/workshop-events' : '/user/workshop-events';
    }

    if (type === 'workshop') {
      return isAdmin ? '/admin/workshop-events' : '/user/workshop-events';
    }

    return isAdmin ? '/admin/dashboard' : '/user/dashboard';
  }

  markAllRead(): void {
    this.notificationService.markAllRead().subscribe(
      () => this.loadNotifications(),
      () => {}
    );
  }

  private checkIsDashboardRoute(url: string): boolean {
    return url.startsWith('/user/dashboard') || url.startsWith('/admin/dashboard');
  }
}
