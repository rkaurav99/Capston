import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Booking } from '../../../models/booking.model';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';

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

  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.booking.WorkshopEventId = +this.route.snapshot.paramMap.get('eventId');
    this.booking.UserId = this.authService.getUserId();
    this.booking.BookingDate = new Date();
  }

  onSubmit(): void {
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
