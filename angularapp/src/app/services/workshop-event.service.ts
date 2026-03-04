import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkshopEvent } from '../models/workshop-event.model';

@Injectable({
  providedIn: 'root'
})
export class WorkshopEventService {

  public apiUrl = '';

  constructor(private http: HttpClient) { }

  /**
   * GET /api/workshop-events
   * Retrieves all workshop events.
   */
  getAllWorkshopEvents(): Observable<WorkshopEvent[]> {
    return this.http.get<WorkshopEvent[]>(`${this.apiUrl}/api/workshop-events`);
  }

  /**
   * GET /api/workshop-event/{workshopEventId}
   * Retrieves a specific workshop event by its ID.
   */
  getWorkshopEventById(workshopEventId: number): Observable<WorkshopEvent> {
    return this.http.get<WorkshopEvent>(`${this.apiUrl}/api/workshop-event/${workshopEventId}`);
  }

  /**
   * POST /api/workshop-event
   * Adds a new workshop event. (Admin only)
   */
  addWorkshopEvent(workshopEvent: WorkshopEvent): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/workshop-event`, workshopEvent);
  }

  /**
   * PUT /api/workshop-event/{workshopEventId}
   * Updates an existing workshop event. (Admin only)
   */
  updateWorkshopEvent(workshopEventId: number, workshopEvent: WorkshopEvent): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/workshop-event/${workshopEventId}`, workshopEvent);
  }

  /**
   * DELETE /api/workshop-event/{workshopEventId}
   * Deletes a workshop event. (Admin only)
   */
  deleteWorkshopEvent(workshopEventId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/workshop-event/${workshopEventId}`);
  }
}
