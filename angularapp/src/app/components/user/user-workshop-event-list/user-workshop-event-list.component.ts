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
  errorMessage: string = '';
  searchText: string = '';

  constructor(
    private workshopEventService: WorkshopEventService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadWorkshopEvents();
  }

  loadWorkshopEvents(): void {
    this.workshopEventService.getAllWorkshopEvents().subscribe(
      (data: WorkshopEvent[]) => {
        this.workshopEvents = data;
      },
      (error) => {
        this.errorMessage = 'Failed to load workshop events.';
      }
    );
  }

  bookEvent(workshopEventId: number): void {
    this.router.navigate(['/user/book-event', workshopEventId]);
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
}
