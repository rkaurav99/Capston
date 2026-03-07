import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkshopEvent } from '../../../models/workshop-event.model';
import { Booking } from '../../../models/booking.model';
import { Feedback } from '../../../models/feedback.model';
import { WorkshopEventService } from '../../../services/workshop-event.service';
import { BookingService } from '../../../services/booking.service';
import { FeedbackService } from '../../../services/feedback.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  workshops: WorkshopEvent[] = [];
  bookings: Booking[] = [];
  feedbacks: Feedback[] = [];
  loading = true;
  private pending = 3;

  constructor(
    private workshopService: WorkshopEventService,
    private bookingService: BookingService,
    private feedbackService: FeedbackService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.workshopService.getAllWorkshopEvents().subscribe(
      d => { this.workshops = d; this.dec(); }, () => this.dec()
    );
    this.bookingService.getAllBookings().subscribe(
      d => { this.bookings = d; this.dec(); }, () => this.dec()
    );
    this.feedbackService.getAllFeedbacks().subscribe(
      d => { this.feedbacks = d; this.dec(); }, () => this.dec()
    );
  }

  private dec(): void { if (--this.pending === 0) this.loading = false; }

  get totalWorkshops()    { return this.workshops.length; }
  get totalBookings()     { return this.bookings.length; }
  get totalFeedbacks()    { return this.feedbacks.length; }
  get approvedBookings()  { return this.bookings.filter(b => b.BookingStatus === 'Approved').length; }
  get pendingBookings()   { return this.bookings.filter(b => ['Submitted','Pending'].includes(b.BookingStatus)).length; }
  get cancelledBookings() { return this.bookings.filter(b => b.BookingStatus === 'Cancelled').length; }

  get recentBookings() {
    return [...this.bookings].sort((a,b) => new Date(b.BookingDate).getTime() - new Date(a.BookingDate).getTime()).slice(0,8);
  }

  get categoryStats(): {name:string, count:number}[] {
    const map: {[k:string]:number} = {};
    this.workshops.forEach(w => { map[w.Category] = (map[w.Category] || 0) + 1; });
    return Object.entries(map).map(([name,count]) => ({name,count})).sort((a,b) => b.count - a.count).slice(0,5);
  }

  get pendingFeedbacks() { return this.feedbacks.filter(f => !f.AdminResponse).length; }

  badgeClass(status: string): string {
    const m: {[k:string]:string} = {
      'Approved':'db-badge--green','Submitted':'db-badge--indigo',
      'Pending':'db-badge--amber','Cancelled':'db-badge--red'
    };
    return m[status] || 'db-badge--gray';
  }

  navTo(path: string): void { this.router.navigate([path]); }
}
