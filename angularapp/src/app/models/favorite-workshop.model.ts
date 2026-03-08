import { WorkshopEvent } from './workshop-event.model';

export interface FavoriteWorkshop {
  FavoriteId: number;
  UserId: number;
  WorkshopEventId: number;
  CreatedAt: Date;
  WorkshopEvent?: WorkshopEvent;
}
