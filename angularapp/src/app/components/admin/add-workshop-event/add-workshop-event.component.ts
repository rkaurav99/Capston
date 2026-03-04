import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { WorkshopEvent } from '../../../models/workshop-event.model';
import { WorkshopEventService } from '../../../services/workshop-event.service';

@Component({
  selector: 'app-add-workshop-event',
  templateUrl: './add-workshop-event.component.html',
  styleUrls: ['./add-workshop-event.component.css']
})
export class AddWorkshopEventComponent {

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

  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  constructor(
    private workshopEventService: WorkshopEventService,
    private router: Router
  ) { }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    this.workshopEventService.addWorkshopEvent(this.workshopEvent).subscribe(
      (response: any) => {
        this.loading = false;
        this.successMessage = response.message || 'Workshop event added successfully!';
        setTimeout(() => {
          this.router.navigate(['/admin/workshop-events']);
        }, 1500);
      },
      (error) => {
        this.loading = false;
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Failed to add workshop event.';
        }
      }
    );
  }

  goBack(): void {
    this.router.navigate(['/admin/workshop-events']);
  }
}
