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

  constructor(
    private workshopService: WorkshopEventService,
    private bookingService: BookingService,
    private feedbackService: FeedbackService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.workshopService.getAllWorkshopEvents().subscribe(d => { this.workshops = d; this.checkDone(); }, () => this.checkDone());
    this.bookingService.getAllBookings().subscribe(d => { this.bookings = d; this.checkDone(); }, () => this.checkDone());
    this.feedbackService.getAllFeedbacks().subscribe(d => { this.feedbacks = d; this.checkDone(); }, () => this.checkDone());
  }

  private checkDone(): void { this.loading = false; }

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
      'Approved':'bg-green-100 text-green-700','Submitted':'bg-indigo-100 text-indigo-700',
      'Pending':'bg-yellow-100 text-yellow-700','Cancelled':'bg-red-100 text-red-700'
    };
    return m[status] || 'bg-gray-100 text-gray-600';
  }

  navTo(path: string): void { this.router.navigate([path]); }
}
