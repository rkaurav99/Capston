import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkshopEvent } from '../../../models/workshop-event.model';
import { WorkshopEventService } from '../../../services/workshop-event.service';

@Component({
  selector: 'app-admin-workshop-event-list',
  templateUrl: './admin-workshop-event-list.component.html',
  styleUrls: ['./admin-workshop-event-list.component.css']
})
export class AdminWorkshopEventListComponent implements OnInit {

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
