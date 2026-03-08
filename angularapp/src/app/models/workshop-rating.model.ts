export interface WorkshopRating {
  RatingId?: number;
  UserId?: number;
  WorkshopEventId: number;
  RatingValue: number;
  ReviewText?: string;
  CreatedAt?: Date;
  User?: {
    UserId: number;
    Username: string;
    Email: string;
  };
}

export interface WorkshopRatingSummary {
  WorkshopEventId: number;
  AverageRating: number;
  TotalRatings: number;
}
