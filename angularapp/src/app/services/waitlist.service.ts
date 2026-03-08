import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WaitlistEntry } from '../models/waitlist-entry.model';

@Injectable({
  providedIn: 'root'
})
export class WaitlistService {
  public apiUrl = '';

  constructor(private http: HttpClient) {}

  joinWaitlist(workshopEventId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/waitlist/join`, { WorkshopEventId: workshopEventId });
  }

  getWaitlistByEvent(workshopEventId: number): Observable<WaitlistEntry[]> {
    return this.http.get<WaitlistEntry[]>(`${this.apiUrl}/api/waitlist/event/${workshopEventId}`);
  }

  getWaitlistByUser(userId: number): Observable<WaitlistEntry[]> {
    return this.http.get<WaitlistEntry[]>(`${this.apiUrl}/api/waitlist/user/${userId}`);
  }
}
