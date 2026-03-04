import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Feedback } from '../models/feedback.model';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  public apiUrl = '';

  constructor(private http: HttpClient) { }

  /**
   * GET /api/feedback
   * Retrieves all feedbacks. (Admin only)
   */
  getAllFeedbacks(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.apiUrl}/api/feedback`);
  }

  /**
   * GET /api/feedback/user/{userId}
   * Retrieves all feedbacks for a specific user. (User only)
   */
  getFeedbacksByUserId(userId: number): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.apiUrl}/api/feedback/user/${userId}`);
  }

  /**
   * POST /api/feedback
   * Adds a new feedback. (User only)
   */
  addFeedback(feedback: Feedback): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/feedback`, feedback);
  }

  /**
   * DELETE /api/feedback/{feedbackId}
   * Deletes a feedback. (User only)
   */
  deleteFeedback(feedbackId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/feedback/${feedbackId}`);
  }
}
