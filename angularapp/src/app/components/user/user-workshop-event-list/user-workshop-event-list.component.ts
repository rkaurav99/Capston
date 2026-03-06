import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkshopEvent } from '../../../models/workshop-event.model';
import { WorkshopEventService } from '../../../services/workshop-event.service';

@Component({
  selector: 'app-user-workshop-event-list',
  templateUrl: './user-workshop-event-list.component.html',
  styleUrls: ['./user-workshop-event-list.component.css']
})
export class UserWorkshopEventListComponent implements OnInit {
  workshopEvents: WorkshopEvent[] = [];
  errorMessage = '';
  searchText = '';
  loading = false;
  viewMode: 'grid' | 'list' = (localStorage.getItem('eventView') as 'grid' | 'list') || 'grid';

  constructor(private workshopEventService: WorkshopEventService, private router: Router) {}

  ngOnInit(): void { this.loadWorkshopEvents(); }

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
}
