export interface Feedback {
  FeedbackId?: number;
  UserId: number;
  User?: {
    UserId: number;
    Username: string;
    Email: string;
  };
  BookingId?: number;
  Booking?: {
    BookingId: number;
    WorkshopEventId: number;
    BookingStatus: string;
    WorkshopEvent?: {
      WorkshopEventId: number;
      EventName: string;
      Category: string;
    };
  };
  FeedbackText: string;
  Date: Date;
  AdminResponse?: string;
  ResponseDate?: Date;
}
