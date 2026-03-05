import { Component, OnInit } from '@angular/core';
import { Feedback } from '../../../models/feedback.model';
import { FeedbackService } from '../../../services/feedback.service';

@Component({
  selector: 'app-admin-feedbacks',
  templateUrl: './admin-feedbacks.component.html',
  styleUrls: ['./admin-feedbacks.component.css']
})
export class AdminFeedbacksComponent implements OnInit {

  feedbacks: Feedback[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  respondingId: number | null = null;
  responseText: string = '';
  respondingLoading: boolean = false;

  constructor(private feedbackService: FeedbackService) { }

  ngOnInit(): void {
    this.loadFeedbacks();
  }

  loadFeedbacks(): void {
    this.feedbackService.getAllFeedbacks().subscribe(
      (data: Feedback[]) => { this.feedbacks = data; },
      () => { this.errorMessage = 'Failed to load feedbacks.'; }
    );
  }

  openRespond(feedbackId: number, existing: string): void {
    this.respondingId = feedbackId;
    this.responseText = existing || '';
    this.successMessage = '';
    this.errorMessage = '';
  }

  cancelRespond(): void {
    this.respondingId = null;
    this.responseText = '';
  }

  submitResponse(feedbackId: number): void {
    if (!this.responseText.trim()) return;
    this.respondingLoading = true;
    this.feedbackService.respondToFeedback(feedbackId, this.responseText).subscribe(
      () => {
        this.respondingLoading = false;
        this.successMessage = 'Response sent successfully!';
        this.respondingId = null;
        this.responseText = '';
        this.loadFeedbacks();
        setTimeout(() => this.successMessage = '', 3000);
      },
      () => {
        this.respondingLoading = false;
        this.errorMessage = 'Failed to send response.';
      }
    );
  }
}
