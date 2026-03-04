import { Component, OnInit } from '@angular/core';
import { Feedback } from '../../../models/feedback.model';
import { FeedbackService } from '../../../services/feedback.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-user-feedback',
  templateUrl: './user-feedback.component.html',
  styleUrls: ['./user-feedback.component.css']
})
export class UserFeedbackComponent implements OnInit {

  feedbacks: Feedback[] = [];
  newFeedbackText: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  constructor(
    private feedbackService: FeedbackService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadFeedbacks();
  }

  loadFeedbacks(): void {
    const userId = this.authService.getUserId();
    this.feedbackService.getFeedbacksByUserId(userId).subscribe(
      (data: Feedback[]) => {
        this.feedbacks = data;
      },
      (error) => {
        // No feedbacks yet, that's fine
        this.feedbacks = [];
      }
    );
  }

  addFeedback(): void {
    if (!this.newFeedbackText.trim()) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    const feedback: Feedback = {
      UserId: this.authService.getUserId(),
      FeedbackText: this.newFeedbackText,
      Date: new Date()
    };

    this.feedbackService.addFeedback(feedback).subscribe(
      (response: any) => {
        this.loading = false;
        this.successMessage = 'Feedback submitted successfully!';
        this.newFeedbackText = '';
        this.loadFeedbacks();
        setTimeout(() => this.successMessage = '', 3000);
      },
      (error) => {
        this.loading = false;
        this.errorMessage = 'Failed to submit feedback.';
      }
    );
  }

  deleteFeedback(feedbackId: number): void {
    if (confirm('Are you sure you want to delete this feedback?')) {
      this.feedbackService.deleteFeedback(feedbackId).subscribe(
        () => {
          this.loadFeedbacks();
        },
        (error) => {
          this.errorMessage = 'Failed to delete feedback.';
        }
      );
    }
  }
}
