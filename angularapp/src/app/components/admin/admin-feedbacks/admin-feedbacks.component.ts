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

  constructor(private feedbackService: FeedbackService) { }

  ngOnInit(): void {
    this.loadFeedbacks();
  }

  loadFeedbacks(): void {
    this.feedbackService.getAllFeedbacks().subscribe(
      (data: Feedback[]) => {
        this.feedbacks = data;
      },
      (error) => {
        this.errorMessage = 'Failed to load feedbacks.';
      }
    );
  }
}
