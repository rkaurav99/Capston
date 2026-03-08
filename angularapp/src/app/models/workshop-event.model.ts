export interface WorkshopEvent {
  WorkshopEventId?: number;
  EventName: string;
  OrganizerName: string;
  Category: string;
  Description: string;
  Location: string;
  StartDateTime: Date;
  EndDateTime: Date;
  Capacity: number;
  Status?: 'Upcoming' | 'Live' | 'Completed' | 'Cancelled' | string;
}
