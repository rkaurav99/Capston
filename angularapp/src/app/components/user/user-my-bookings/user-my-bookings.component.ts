import { Component, OnInit } from '@angular/core';
import { Booking } from '../../../models/booking.model';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';
import { BookingQrService } from '../../../services/booking-qr.service';
import { WorkshopRatingService } from '../../../services/workshop-rating.service';
import { WorkshopRating } from '../../../models/workshop-rating.model';

@Component({
  selector: 'app-user-my-bookings',
  templateUrl: './user-my-bookings.component.html',
  styleUrls: ['./user-my-bookings.component.css']
})
export class UserMyBookingsComponent implements OnInit {

  bookings: Booking[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  qrImage: string = '';
  qrBookingId: number | null = null;
  ratingBooking: Booking | null = null;
  ratingValue: number = 0;
  reviewText: string = '';
  ratedEventIds: Set<number> = new Set();

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private bookingQrService: BookingQrService,
    private workshopRatingService: WorkshopRatingService
  ) { }

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    const userId = this.authService.getUserId();
    this.bookingService.getBookingsByUserId(userId).subscribe(
      (data: Booking[]) => {
        this.bookings = data;
        this.loadRatedWorkshops();
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

  loadRatedWorkshops(): void {
    const userId = this.authService.getUserId();
    this.ratedEventIds = new Set();

    const completed = this.bookings.filter(b => this.isWorkshopCompleted(b));
    completed.forEach((booking) => {
      this.workshopRatingService.getRatingsByWorkshop(booking.WorkshopEventId).subscribe(
        (ratings) => {
          if (ratings.some(r => r.UserId === userId)) {
            this.ratedEventIds.add(booking.WorkshopEventId);
          }
        },
        () => {}
      );
    });
  }

  requestCancellation(booking: Booking): void {
    if (!confirm(`Request cancellation for Booking #${booking.BookingId}? An admin will review your request.`)) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.bookingService.requestCancellation(booking.BookingId).subscribe(
      () => {
        this.successMessage = 'Cancellation request submitted. Awaiting admin approval.';
        this.loadBookings();
        setTimeout(() => this.successMessage = '', 4000);
      },
      (error) => {
        this.errorMessage = error?.error?.message || 'Failed to request cancellation.';
      }
    );
  }

  isWorkshopCompleted(booking: Booking): boolean {
    if (!booking.WorkshopEvent) return false;
    return new Date(booking.WorkshopEvent.EndDateTime) < new Date();
  }

  canShowQr(booking: Booking): boolean {
    return booking.BookingStatus === 'Approved';
  }

  openQr(booking: Booking): void {
    if (!this.canShowQr(booking)) return;
    this.bookingQrService.generateBookingQr({
      BookingId: booking.BookingId,
      UserId: booking.UserId,
      WorkshopEventId: booking.WorkshopEventId,
      BookingStatus: booking.BookingStatus
    }).then((img) => {
      this.qrImage = img;
      this.qrBookingId = booking.BookingId;
    });
  }

  closeQr(): void {
    this.qrImage = '';
    this.qrBookingId = null;
  }

  downloadQr(): void {
    if (!this.qrImage || !this.qrBookingId) return;
    const a = document.createElement('a');
    a.href = this.qrImage;
    a.download = `booking-${this.qrBookingId}-qr.png`;
    a.click();
  }

  openRating(booking: Booking): void {
    this.ratingBooking = booking;
    this.ratingValue = 0;
    this.reviewText = '';
  }

  closeRating(): void {
    this.ratingBooking = null;
    this.ratingValue = 0;
    this.reviewText = '';
  }

  submitRating(): void {
    if (!this.ratingBooking || this.ratingValue < 1 || this.ratingValue > 5) {
      this.errorMessage = 'Please select a valid rating between 1 and 5.';
      return;
    }

    const payload: WorkshopRating = {
      WorkshopEventId: this.ratingBooking.WorkshopEventId,
      RatingValue: this.ratingValue,
      ReviewText: this.reviewText
    };

    this.workshopRatingService.addRating(payload).subscribe(
      () => {
        this.successMessage = 'Rating submitted successfully.';
        this.ratedEventIds.add(this.ratingBooking!.WorkshopEventId);
        this.closeRating();
        setTimeout(() => this.successMessage = '', 3000);
      },
      (err) => {
        this.errorMessage = err?.error?.message || 'Failed to submit rating.';
      }
    );
  }
}
