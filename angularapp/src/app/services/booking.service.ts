import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  public apiUrl = '';

  constructor(private http: HttpClient) { }

  /**
   * GET /api/bookings
   * Retrieves all bookings. (Admin only)
   */
  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/api/bookings`);
  }

  /**
   * GET /api/bookings/user/{userId}
   * Retrieves all bookings for a specific user. (User only)
   */
  getBookingsByUserId(userId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/api/bookings/user/${userId}`);
  }

  /**
   * POST /api/booking
   * Adds a new booking. (User only)
   */
  addBooking(booking: Booking): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/booking`, booking);
  }

  /**
   * PUT /api/booking/{bookingId}
   * Updates an existing booking. (Admin only)
   */
  updateBooking(bookingId: number, booking: Booking): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/booking/${bookingId}`, booking);
  }

  /**
   * DELETE /api/booking/{bookingId}
   * Deletes a booking. (Admin role)
   */
  deleteBooking(bookingId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/booking/${bookingId}`);
  }
}
