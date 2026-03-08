import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Booking } from '../../../models/booking.model';
import { WorkshopEvent } from '../../../models/workshop-event.model';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';
import { WorkshopEventService } from '../../../services/workshop-event.service';
import { WaitlistService } from '../../../services/waitlist.service';

@Component({
  selector: 'app-add-booking',
  templateUrl: './add-booking.component.html',
  styleUrls: ['./add-booking.component.css']
})
export class AddBookingComponent implements OnInit {

  booking: Booking = {
    BookingId: 0,
    UserId: 0,
    WorkshopEventId: 0,
    BookingStatus: 'Submitted',
    BookingDate: new Date(),
    Gender: '',
    Age: 0,
    Occupation: '',
    City: '',
    Proof: '',
    AdditionalNotes: ''
  };

  workshopEvent: WorkshopEvent | null = null;
  isWorkshopFull: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  proofPreview: string = '';
  proofError: string = '';

  onProofFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.proofError = '';
    this.proofPreview = '';
    this.booking.Proof = '';

    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type)) {
      this.proofError = 'Only JPG or PNG images are accepted.';
      input.value = '';
      return;
    }
    if (file.size > 200 * 1024) {
      this.proofError = 'Image must be smaller than 200 KB.';
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.proofPreview = result;
      this.booking.Proof = result;
    };
    reader.readAsDataURL(file);
  }

  constructor(
    private bookingService: BookingService,
    private workshopEventService: WorkshopEventService,
    private waitlistService: WaitlistService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const eventId = +this.route.snapshot.paramMap.get('eventId');
    this.booking.WorkshopEventId = eventId;
    this.booking.UserId = this.authService.getUserId();
    this.booking.BookingDate = new Date();

    // Load event details for status/fullness hints on the booking page
    this.workshopEventService.getWorkshopEventById(eventId).subscribe(
      (ev: WorkshopEvent) => {
        this.workshopEvent = ev;
        this.isWorkshopFull = ev.Capacity <= 0;
      },
      () => {}
    );
  }

  joinWaitlist(): void {
    this.errorMessage = '';
    if (!this.workshopEvent) return;

    this.waitlistService.joinWaitlist(this.workshopEvent.WorkshopEventId).subscribe(
      () => {
        this.successMessage = 'You have joined the waitlist successfully.';
        setTimeout(() => this.router.navigate(['/user/workshop-events']), 1200);
      },
      (error) => {
        this.errorMessage = error?.error?.message || 'Failed to join waitlist.';
      }
    );
  }

  onSubmit(): void {
    if (!this.booking.Proof) {
      this.proofError = 'Please upload a valid ID proof image (JPG or PNG, max 200 KB).';
      return;
    }
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    this.bookingService.addBooking(this.booking).subscribe(
      (response: any) => {
        this.loading = false;
        this.successMessage = response.message || 'Booking added successfully!';
        setTimeout(() => {
          this.router.navigate(['/user/my-bookings']);
        }, 1500);
      },
      (error) => {
        this.loading = false;
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Failed to add booking.';
        }
      }
    );
  }

  goBack(): void {
    this.router.navigate(['/user/workshop-events']);
  }
}
