import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Booking } from '../../../models/booking.model';
import { WorkshopEvent } from '../../../models/workshop-event.model';
import { BookingService } from '../../../services/booking.service';
import { WorkshopEventService } from '../../../services/workshop-event.service';
import { AuthService } from '../../../services/auth.service';
import { FavoriteWorkshopService } from '../../../services/favorite-workshop.service';
import { NotificationService } from '../../../services/notification.service';
import { WorkshopRatingService } from '../../../services/workshop-rating.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  bookings: Booking[] = [];
  workshops: WorkshopEvent[] = [];
  loading = true;
  favoritesCount = 0;
  unreadNotifications = 0;
  completedAwaitingRating = 0;

  constructor(
    private bookingService: BookingService,
    private workshopService: WorkshopEventService,
    private favoriteWorkshopService: FavoriteWorkshopService,
    private notificationService: NotificationService,
    private workshopRatingService: WorkshopRatingService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    let pending = 4;
    const dec = () => { if (--pending === 0) this.loading = false; };
    const uid = this.authService.getUserId();
    this.bookingService.getBookingsByUserId(uid).subscribe(
      (d: Booking[]) => {
        this.bookings = d;
        this.computeCompletedAwaitingRating();
        dec();
      },
      () => { this.bookings = []; dec(); }
    );
    this.workshopService.getAllWorkshopEvents().subscribe(
      (d: WorkshopEvent[]) => { this.workshops = d; dec(); },
      () => { this.workshops = []; dec(); }
    );

    this.favoriteWorkshopService.getFavorites().subscribe(
      (data) => { this.favoritesCount = data.length; dec(); },
      () => { this.favoritesCount = 0; dec(); }
    );

    this.notificationService.getUnreadCount().subscribe(
      (data) => { this.unreadNotifications = data.unreadCount; dec(); },
      () => { this.unreadNotifications = 0; dec(); }
    );
  }

  get totalBookings()     { return this.bookings.length; }
  get approvedBookings()  { return this.bookings.filter(b => b.BookingStatus === 'Approved').length; }
  get pendingBookings()   { return this.bookings.filter(b => ['Submitted','Pending'].includes(b.BookingStatus)).length; }
  get cancelledBookings() { return this.bookings.filter(b => b.BookingStatus === 'Cancelled').length; }
  get recentBookings()    { return [...this.bookings].sort((a,b) => new Date(b.BookingDate).getTime() - new Date(a.BookingDate).getTime()).slice(0,5); }
  get upcomingWorkshops() { return this.workshops.filter(w => new Date(w.StartDateTime) > new Date()).slice(0,4); }

  badgeClass(status: string): string {
    const m: {[k:string]:string} = {
      'Approved':'db-badge--green','Submitted':'db-badge--indigo',
      'Pending':'db-badge--amber','Cancelled':'db-badge--red'
    };
    return m[status] || 'db-badge--gray';
  }

  daysUntil(d: Date | string): number {
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
    return diff > 0 ? diff : 0;
  }

  goBook(id: number): void { this.router.navigate(['/user/book-event', id]); }
  goBookings(): void { this.router.navigate(['/user/my-bookings']); }
  goEvents(): void { this.router.navigate(['/user/workshop-events']); }

  private computeCompletedAwaitingRating(): void {
    const userId = this.authService.getUserId();
    const completed = this.bookings.filter(b => b.WorkshopEvent && new Date(b.WorkshopEvent.EndDateTime) < new Date());

    if (completed.length === 0) {
      this.completedAwaitingRating = 0;
      return;
    }

    let awaiting = 0;
    let checked = 0;
    completed.forEach((booking) => {
      this.workshopRatingService.getRatingsByWorkshop(booking.WorkshopEventId).subscribe(
        (ratings) => {
          if (!ratings.some(r => r.UserId === userId)) {
            awaiting++;
          }
          checked++;
          if (checked === completed.length) {
            this.completedAwaitingRating = awaiting;
          }
        },
        () => {
          checked++;
          if (checked === completed.length) {
            this.completedAwaitingRating = awaiting;
          }
        }
      );
    });
  }
}
