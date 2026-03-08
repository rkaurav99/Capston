export interface WaitlistEntry {
  WaitlistId?: number;
  UserId?: number;
  WorkshopEventId: number;
  JoinedAt?: Date;
  Status?: 'Waiting' | 'Promoted' | 'Removed' | string;
  User?: {
    UserId: number;
    Username: string;
    Email: string;
  };
  WorkshopEvent?: {
    WorkshopEventId: number;
    EventName: string;
    Status?: string;
  };
}
