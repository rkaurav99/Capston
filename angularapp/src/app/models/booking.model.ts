export interface Booking {
  BookingId: number;
  UserId: number;
  User?: {
    UserId: number;
    Username: string;
    Email?: string;
  };
  WorkshopEventId: number;
  BookingStatus: string;
  BookingDate: Date;
  Gender: string;
  Age: number;
  Occupation: string;
  City: string;
  Proof: string;
  AdditionalNotes?: string;
  Is24HourReminderSent?: boolean;
  Is6HourReminderSent?: boolean;
  WorkshopEvent?: {
    WorkshopEventId: number;
    EventName: string;
    Category: string;
    Location: string;
    StartDateTime: Date;
    EndDateTime: Date;
    Status?: string;
  };
}
