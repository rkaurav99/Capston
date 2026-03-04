import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkshopEvent } from '../../../models/workshop-event.model';
import { WorkshopEventService } from '../../../services/workshop-event.service';

@Component({
  selector: 'app-edit-workshop-event',
  templateUrl: './edit-workshop-event.component.html',
  styleUrls: ['./edit-workshop-event.component.css']
})
export class EditWorkshopEventComponent implements OnInit {

  workshopEvent: WorkshopEvent = {
    EventName: '',
    OrganizerName: '',
    Category: '',
    Description: '',
    Location: '',
    StartDateTime: new Date(),
    EndDateTime: new Date(),
    Capacity: 0
  };

  workshopEventId: number;
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  constructor(
    private workshopEventService: WorkshopEventService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.workshopEventId = +this.route.snapshot.paramMap.get('id');
    this.loadEvent();
  }

  loadEvent(): void {
    this.workshopEventService.getWorkshopEventById(this.workshopEventId).subscribe(
      (data: WorkshopEvent) => {
        this.workshopEvent = data;
      },
      (error) => {
        this.errorMessage = 'Failed to load workshop event.';
      }
    );
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    this.workshopEventService.updateWorkshopEvent(this.workshopEventId, this.workshopEvent).subscribe(
      (response: any) => {
        this.loading = false;
        this.successMessage = response.message || 'Workshop event updated successfully!';
        setTimeout(() => {
          this.router.navigate(['/admin/workshop-events']);
        }, 1500);
      },
      (error) => {
        this.loading = false;
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Failed to update workshop event.';
        }
      }
    );
  }

  goBack(): void {
    this.router.navigate(['/admin/workshop-events']);
  }
}
