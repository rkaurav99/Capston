import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkshopEvent } from '../../../models/workshop-event.model';
import { Booking } from '../../../models/booking.model';
import { WorkshopEventService } from '../../../services/workshop-event.service';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';
import { WaitlistService } from '../../../services/waitlist.service';
import { FavoriteWorkshopService } from '../../../services/favorite-workshop.service';
import { WorkshopRatingService } from '../../../services/workshop-rating.service';
import { WaitlistEntry } from '../../../models/waitlist-entry.model';
import { WorkshopRatingSummary } from '../../../models/workshop-rating.model';

@Component({
  selector: 'app-user-workshop-event-list',
  templateUrl: './user-workshop-event-list.component.html',
  styleUrls: ['./user-workshop-event-list.component.css']
})
export class UserWorkshopEventListComponent implements OnInit {
  workshopEvents: WorkshopEvent[] = [];
  bookedEventIds: Set<number> = new Set();
  waitlistedEventIds: Set<number> = new Set();
  favoriteEventIds: Set<number> = new Set();
  ratingSummaryMap: { [eventId: number]: WorkshopRatingSummary } = {};
  errorMessage = '';
  successMessage = '';
  searchText = '';
  loading = false;
  favoriteLoadingMap: { [eventId: number]: boolean } = {};
  waitlistLoadingMap: { [eventId: number]: boolean } = {};
  viewMode: 'grid' | 'list' = (localStorage.getItem('eventView') as 'grid' | 'list') || 'grid';

  constructor(
    private workshopEventService: WorkshopEventService,
    private bookingService: BookingService,
    private waitlistService: WaitlistService,
    private favoriteWorkshopService: FavoriteWorkshopService,
    private workshopRatingService: WorkshopRatingService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadWorkshopEvents();
    this.loadUserBookings();
    this.loadWaitlistEntries();
    this.loadFavorites();
    this.loadRatingSummaries();
  }

  loadWorkshopEvents(): void {
    this.loading = true;
    this.workshopEventService.getAllWorkshopEvents().subscribe(
      (data: WorkshopEvent[]) => {
        this.workshopEvents = data;
        this.loading = false;
      },
      () => {
        this.errorMessage = 'Failed to load workshop events.';
        this.loading = false;
      }
    );
  }

  loadUserBookings(): void {
    const userId = this.authService.getUserId();
    this.bookingService.getBookingsByUserId(userId).subscribe(
      (bookings: Booking[]) => {
        this.bookedEventIds = new Set(bookings.map(b => b.WorkshopEventId));
      },
      () => { this.bookedEventIds = new Set(); }
    );
  }

  loadWaitlistEntries(): void {
    const userId = this.authService.getUserId();
    this.waitlistService.getWaitlistByUser(userId).subscribe(
      (entries: WaitlistEntry[]) => {
        this.waitlistedEventIds = new Set(entries
          .filter(x => x.Status === 'Waiting' || x.Status === 'Promoted')
          .map(x => x.WorkshopEventId));
      },
      () => { this.waitlistedEventIds = new Set(); }
    );
  }

  loadFavorites(): void {
    this.favoriteWorkshopService.getFavorites().subscribe(
      (favorites) => {
        this.favoriteEventIds = new Set(favorites.map(f => f.WorkshopEventId));
      },
      () => { this.favoriteEventIds = new Set(); }
    );
  }

  loadRatingSummaries(): void {
    this.workshopRatingService.getAllRatingSummaries().subscribe(
      (summaries: WorkshopRatingSummary[]) => {
        const map: { [eventId: number]: WorkshopRatingSummary } = {};
        summaries.forEach(s => map[s.WorkshopEventId] = s);
        this.ratingSummaryMap = map;
      },
      () => { this.ratingSummaryMap = {}; }
    );
  }

  isAlreadyBooked(eventId: number): boolean {
    return this.bookedEventIds.has(eventId);
  }

  isFavorite(eventId: number): boolean {
    return this.favoriteEventIds.has(eventId);
  }

  isWaitlisted(eventId: number): boolean {
    return this.waitlistedEventIds.has(eventId);
  }

  isWorkshopFull(ev: WorkshopEvent): boolean {
    return ev.Capacity <= 0;
  }

  toggleFavorite(eventId: number): void {
    if (this.favoriteLoadingMap[eventId]) return;
    this.favoriteLoadingMap[eventId] = true;

    const action$ = this.isFavorite(eventId)
      ? this.favoriteWorkshopService.removeFavorite(eventId)
      : this.favoriteWorkshopService.addFavorite(eventId);

    action$.subscribe(
      () => {
        if (this.isFavorite(eventId)) {
          this.favoriteEventIds.delete(eventId);
          this.successMessage = 'Removed from favorites';
        } else {
          this.favoriteEventIds.add(eventId);
          this.successMessage = 'Added to favorites';
        }
        this.favoriteLoadingMap[eventId] = false;
        setTimeout(() => this.successMessage = '', 2000);
      },
      (err) => {
        this.favoriteLoadingMap[eventId] = false;
        this.errorMessage = err?.error?.message || 'Failed to update favorite.';
      }
    );
  }

  joinWaitlist(eventId: number): void {
    if (this.waitlistLoadingMap[eventId] || this.isWaitlisted(eventId)) return;
    this.waitlistLoadingMap[eventId] = true;
    this.waitlistService.joinWaitlist(eventId).subscribe(
      () => {
        this.waitlistedEventIds.add(eventId);
        this.successMessage = 'Joined waitlist successfully';
        this.waitlistLoadingMap[eventId] = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      (err) => {
        this.waitlistLoadingMap[eventId] = false;
        this.errorMessage = err?.error?.message || 'Failed to join waitlist.';
      }
    );
  }

  bookEvent(workshopEventId: number): void {
    this.router.navigate(['/user/book-event', workshopEventId]);
  }

  setView(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
    localStorage.setItem('eventView', mode);
  }

  get filteredEvents(): WorkshopEvent[] {
    if (!this.searchText.trim()) return this.workshopEvents;
    const s = this.searchText.toLowerCase();
    return this.workshopEvents.filter(ev =>
      ev.EventName.toLowerCase().includes(s) ||
      ev.Category.toLowerCase().includes(s) ||
      ev.OrganizerName.toLowerCase().includes(s) ||
      ev.Location.toLowerCase().includes(s)
    );
  }

  getEventStatusClass(status: string | undefined): string {
    if (status === 'Live') return 'bg-green-100 text-green-700';
    if (status === 'Completed') return 'bg-slate-100 text-slate-700';
    if (status === 'Cancelled') return 'bg-red-100 text-red-700';
    return 'bg-indigo-100 text-indigo-700';
  }

  getRatingSummary(eventId: number): WorkshopRatingSummary | null {
    return this.ratingSummaryMap[eventId] || null;
  }
}
