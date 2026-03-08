import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkshopRating, WorkshopRatingSummary } from '../models/workshop-rating.model';

@Injectable({
  providedIn: 'root'
})
export class WorkshopRatingService {
  public apiUrl = '';

  constructor(private http: HttpClient) {}

  getRatingsByWorkshop(workshopEventId: number): Observable<WorkshopRating[]> {
    return this.http.get<WorkshopRating[]>(`${this.apiUrl}/api/workshop-ratings/workshop/${workshopEventId}`);
  }

  getRatingSummaryByWorkshop(workshopEventId: number): Observable<WorkshopRatingSummary> {
    return this.http.get<WorkshopRatingSummary>(`${this.apiUrl}/api/workshop-ratings/summary/${workshopEventId}`);
  }

  getAllRatingSummaries(): Observable<WorkshopRatingSummary[]> {
    return this.http.get<WorkshopRatingSummary[]>(`${this.apiUrl}/api/workshop-ratings/summary`);
  }

  addRating(rating: WorkshopRating): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/workshop-ratings`, rating);
  }

  updateRating(ratingId: number, rating: WorkshopRating): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/workshop-ratings/${ratingId}`, rating);
  }
}
