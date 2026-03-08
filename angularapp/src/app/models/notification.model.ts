export interface NotificationItem {
  NotificationId: number;
  UserId: number;
  Title: string;
  Message: string;
  Type: string;
  IsRead: boolean;
  CreatedAt: Date;
  RelatedEntityId?: number;
}
