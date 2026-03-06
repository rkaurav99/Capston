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

  constructor(private workshopEventService: WorkshopEventService, private router: Router) {}

  ngOnInit(): void { this.loadWorkshopEvents(); }

  loadWorkshopEvents(): void {
    this.workshopEventService.getAllWorkshopEvents().subscribe(
      (data: WorkshopEvent[]) => { this.workshopEvents = data; },
      () => { this.errorMessage = 'Failed to load workshop events.'; }
    );
  }

  bookEvent(workshopEventId: number): void {
    this.router.navigate(['/user/book-event', workshopEventId]);
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
