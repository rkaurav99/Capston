import { Component, OnInit } from '@angular/core';
import { Booking } from '../../../models/booking.model';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-user-my-bookings',
  templateUrl: './user-my-bookings.component.html',
  styleUrls: ['./user-my-bookings.component.css']
})
export class UserMyBookingsComponent implements OnInit {

  bookings: Booking[] = [];
  errorMessage: string = '';

  constructor(
    private bookingService: BookingService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    const userId = this.authService.getUserId();
    this.bookingService.getBookingsByUserId(userId).subscribe(
      (data: Booking[]) => {
        this.bookings = data;
      },
      (error) => {
        if (error.status === 404) {
          this.bookings = [];
        } else {
          this.errorMessage = 'Failed to load bookings.';
        }
      }
    );
  }
}
