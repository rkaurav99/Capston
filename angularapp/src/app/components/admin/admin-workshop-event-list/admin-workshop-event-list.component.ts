import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkshopEvent } from '../../../models/workshop-event.model';
import { WorkshopEventService } from '../../../services/workshop-event.service';
import { WaitlistService } from '../../../services/waitlist.service';
import { WorkshopRatingService } from '../../../services/workshop-rating.service';
import { WorkshopRatingSummary } from '../../../models/workshop-rating.model';
import { WaitlistEntry } from '../../../models/waitlist-entry.model';

@Component({
  selector: 'app-admin-workshop-event-list',
  templateUrl: './admin-workshop-event-list.component.html',
  styleUrls: ['./admin-workshop-event-list.component.css']
})
export class AdminWorkshopEventListComponent implements OnInit {

  workshopEvents: WorkshopEvent[] = [];
  errorMessage: string = '';
  searchText: string = '';
  loading: boolean = false;
  waitlistCountMap: { [eventId: number]: number } = {};
  ratingSummaryMap: { [eventId: number]: WorkshopRatingSummary } = {};
  waitlistPreview: WaitlistEntry[] = [];
  waitlistPreviewEventName = '';
  viewMode: 'grid' | 'list' = (localStorage.getItem('eventView') as 'grid' | 'list') || 'grid';

  constructor(
    private workshopEventService: WorkshopEventService,
    private waitlistService: WaitlistService,
    private workshopRatingService: WorkshopRatingService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadWorkshopEvents();
  }

  loadWorkshopEvents(): void {
    this.loading = true;
    this.workshopEventService.getAllWorkshopEvents().subscribe(
      (data: WorkshopEvent[]) => {
        this.workshopEvents = data;
        this.loadWaitlistCounts();
        this.loading = false;
      },
      (error) => {
        this.errorMessage = 'Failed to load workshop events.';
        this.loading = false;
      }
    );

    this.workshopRatingService.getAllRatingSummaries().subscribe(
      (summaries) => {
        const map: { [eventId: number]: WorkshopRatingSummary } = {};
        summaries.forEach(x => map[x.WorkshopEventId] = x);
        this.ratingSummaryMap = map;
      },
      () => {}
    );
  }

  loadWaitlistCounts(): void {
    const map: { [eventId: number]: number } = {};
    if (this.workshopEvents.length === 0) {
      this.waitlistCountMap = map;
      return;
    }

    this.workshopEvents.forEach((ev) => {
      this.waitlistService.getWaitlistByEvent(ev.WorkshopEventId).subscribe(
        (rows) => {
          map[ev.WorkshopEventId] = rows.filter(r => r.Status === 'Waiting').length;
          this.waitlistCountMap = { ...map };
        },
        () => {
          map[ev.WorkshopEventId] = 0;
          this.waitlistCountMap = { ...map };
        }
      );
    });
  }

  addEvent(): void {
    this.router.navigate(['/admin/add-workshop-event']);
  }

  editEvent(workshopEventId: number): void {
    this.router.navigate(['/admin/edit-workshop-event', workshopEventId]);
  }

  deleteEvent(workshopEventId: number): void {
    if (confirm('Are you sure you want to delete this workshop event?')) {
      this.workshopEventService.deleteWorkshopEvent(workshopEventId).subscribe(
        () => {
          this.loadWorkshopEvents();
        },
        (error) => {
          if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Failed to delete workshop event.';
          }
        }
      );
    }
  }

  setView(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
    localStorage.setItem('eventView', mode);
  }

  get filteredEvents(): WorkshopEvent[] {
    if (!this.searchText) {
      return this.workshopEvents;
    }
    const search = this.searchText.toLowerCase();
    return this.workshopEvents.filter(event =>
      event.EventName.toLowerCase().includes(search) ||
      event.Category.toLowerCase().includes(search) ||
      event.OrganizerName.toLowerCase().includes(search) ||
      event.Location.toLowerCase().includes(search)
    );
  }

  getStatusClass(status: string | undefined): string {
    if (status === 'Live') return 'bg-green-100 text-green-700';
    if (status === 'Completed') return 'bg-slate-100 text-slate-700';
    if (status === 'Cancelled') return 'bg-red-100 text-red-700';
    return 'bg-indigo-100 text-indigo-700';
  }

  openWaitlistPreview(eventId: number, eventName: string): void {
    this.waitlistPreviewEventName = eventName;
    this.waitlistService.getWaitlistByEvent(eventId).subscribe(
      (rows) => this.waitlistPreview = rows,
      () => this.waitlistPreview = []
    );
  }

  closeWaitlistPreview(): void {
    this.waitlistPreview = [];
    this.waitlistPreviewEventName = '';
  }
}
