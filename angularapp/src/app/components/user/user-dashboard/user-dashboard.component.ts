import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Booking } from '../../../models/booking.model';
import { WorkshopEvent } from '../../../models/workshop-event.model';
import { BookingService } from '../../../services/booking.service';
import { WorkshopEventService } from '../../../services/workshop-event.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  bookings: Booking[] = [];
  workshops: WorkshopEvent[] = [];
  loading = true;

  constructor(
    private bookingService: BookingService,
    private workshopService: WorkshopEventService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const uid = this.authService.getUserId();
    this.bookingService.getBookingsByUserId(uid).subscribe(
      (d: Booking[]) => { this.bookings = d; this.loading = false; },
      () => { this.bookings = []; this.loading = false; }
    );
    this.workshopService.getAllWorkshopEvents().subscribe(
      (d: WorkshopEvent[]) => { this.workshops = d; },
      () => { this.workshops = []; }
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
      'Approved':'bg-green-100 text-green-700','Submitted':'bg-indigo-100 text-indigo-700',
      'Pending':'bg-yellow-100 text-yellow-700','Cancelled':'bg-red-100 text-red-700'
    };
    return m[status] || 'bg-gray-100 text-gray-600';
  }

  daysUntil(d: Date | string): number {
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
    return diff > 0 ? diff : 0;
  }

  goBook(id: number): void { this.router.navigate(['/user/book-event', id]); }
  goBookings(): void { this.router.navigate(['/user/my-bookings']); }
  goEvents(): void { this.router.navigate(['/user/workshop-events']); }
}
