import { Component, OnInit } from '@angular/core';
import { Booking } from '../../../models/booking.model';
import { BookingService } from '../../../services/booking.service';

@Component({
  selector: 'app-admin-bookings',
  templateUrl: './admin-bookings.component.html',
  styleUrls: ['./admin-bookings.component.css']
})
export class AdminBookingsComponent implements OnInit {

  bookings: Booking[] = [];
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private bookingService: BookingService) { }

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.bookingService.getAllBookings().subscribe(
      (data: Booking[]) => {
        this.bookings = data;
      },
      (error) => {
        this.errorMessage = 'Failed to load bookings.';
      }
    );
  }

  updateStatus(booking: Booking, status: string): void {
    const updatedBooking = { ...booking, BookingStatus: status };
    this.bookingService.updateBooking(booking.BookingId, updatedBooking).subscribe(
      () => {
        this.successMessage = `Booking ${status.toLowerCase()} successfully!`;
        this.loadBookings();
        setTimeout(() => this.successMessage = '', 3000);
      },
      (error) => {
        this.errorMessage = 'Failed to update booking status.';
      }
    );
  }

  deleteBooking(bookingId: number): void {
    if (confirm('Are you sure you want to delete this booking?')) {
      this.bookingService.deleteBooking(bookingId).subscribe(
        () => {
          this.loadBookings();
        },
        (error) => {
          this.errorMessage = 'Failed to delete booking.';
        }
      );
    }
  }
}
