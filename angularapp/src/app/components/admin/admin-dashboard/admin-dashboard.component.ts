import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkshopEvent } from '../../../models/workshop-event.model';
import { Booking } from '../../../models/booking.model';
import { Feedback } from '../../../models/feedback.model';
import { WorkshopEventService } from '../../../services/workshop-event.service';
import { BookingService } from '../../../services/booking.service';
import { FeedbackService } from '../../../services/feedback.service';
import { WaitlistService } from '../../../services/waitlist.service';
import { WorkshopRatingService } from '../../../services/workshop-rating.service';
import { WorkshopRatingSummary } from '../../../models/workshop-rating.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  workshops: WorkshopEvent[] = [];
  bookings: Booking[] = [];
  feedbacks: Feedback[] = [];
  ratingSummaries: WorkshopRatingSummary[] = [];
  loading = true;
  private pending = 4;
  waitlistedCount = 0;
  averageRating = 0;

  constructor(
    private workshopService: WorkshopEventService,
    private bookingService: BookingService,
    private feedbackService: FeedbackService,
    private waitlistService: WaitlistService,
    private workshopRatingService: WorkshopRatingService,
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
    this.workshopRatingService.getAllRatingSummaries().subscribe(
      d => {
        this.ratingSummaries = d;
        this.averageRating = d.length
          ? Number((d.reduce((sum, x) => sum + x.AverageRating, 0) / d.length).toFixed(2))
          : 0;
        this.dec();
      },
      () => this.dec()
    );

    // Aggregate waitlist count by scanning event waitlists
    this.workshopService.getAllWorkshopEvents().subscribe(
      (events) => {
        if (!events.length) return;
        let done = 0;
        let total = 0;
        events.forEach((ev) => {
          this.waitlistService.getWaitlistByEvent(ev.WorkshopEventId).subscribe(
            (rows) => {
              total += rows.filter(r => r.Status === 'Waiting').length;
              done++;
              if (done === events.length) {
                this.waitlistedCount = total;
              }
            },
            () => {
              done++;
              if (done === events.length) {
                this.waitlistedCount = total;
              }
            }
          );
        });
      },
      () => {}
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
  get liveWorkshops() { return this.workshops.filter(w => w.Status === 'Live').length; }
  get upcomingWorkshops() { return this.workshops.filter(w => w.Status === 'Upcoming').length; }

  badgeClass(status: string): string {
    const m: {[k:string]:string} = {
      'Approved':'db-badge--green','Submitted':'db-badge--indigo',
      'Pending':'db-badge--amber','Cancelled':'db-badge--red'
    };
    return m[status] || 'db-badge--gray';
  }

  navTo(path: string): void { this.router.navigate([path]); }
}
