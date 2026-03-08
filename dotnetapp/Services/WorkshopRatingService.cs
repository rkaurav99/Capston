using dotnetapp.Data;
using dotnetapp.Exceptions;
using dotnetapp.Models;
using Microsoft.EntityFrameworkCore;

namespace dotnetapp.Services
{
    public class WorkshopRatingService
    {
        private readonly ApplicationDbContext _context;

        public WorkshopRatingService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<WorkshopRating>> GetRatingsByWorkshop(int workshopEventId)
        {
            return await _context.WorkshopRatings
                .Where(r => r.WorkshopEventId == workshopEventId)
                .Include(r => r.User)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<object> GetRatingSummaryByWorkshop(int workshopEventId)
        {
            var ratings = await _context.WorkshopRatings
                .Where(r => r.WorkshopEventId == workshopEventId)
                .ToListAsync();

            if (!ratings.Any())
                return new { WorkshopEventId = workshopEventId, AverageRating = 0.0, TotalRatings = 0 };

            return new
            {
                WorkshopEventId = workshopEventId,
                AverageRating = Math.Round(ratings.Average(r => r.RatingValue), 2),
                TotalRatings = ratings.Count
            };
        }

        public async Task<IEnumerable<object>> GetAllRatingSummaries()
        {
            return await _context.WorkshopRatings
                .GroupBy(r => r.WorkshopEventId)
                .Select(g => new
                {
                    WorkshopEventId = g.Key,
                    AverageRating = Math.Round(g.Average(x => x.RatingValue), 2),
                    TotalRatings = g.Count()
                })
                .Cast<object>()
                .ToListAsync();
        }

        public async Task<bool> AddRating(WorkshopRating rating)
        {
            if (rating.RatingValue < 1 || rating.RatingValue > 5)
                throw new WorkshopEventException("Rating value must be between 1 and 5.");

            var workshopEvent = await _context.WorkshopEvents.FindAsync(rating.WorkshopEventId);
            if (workshopEvent == null)
                throw new WorkshopEventException("Workshop event not found.");

            if (DateTime.UtcNow <= workshopEvent.EndDateTime)
                throw new WorkshopEventException("You can rate this workshop only after it is completed.");

            var hasBooking = await _context.Bookings
                .AnyAsync(b => b.UserId == rating.UserId && b.WorkshopEventId == rating.WorkshopEventId && b.BookingStatus != "Cancelled");
            if (!hasBooking)
                throw new WorkshopEventException("Only users who booked this workshop can rate it.");

            var existing = await _context.WorkshopRatings
                .FirstOrDefaultAsync(r => r.UserId == rating.UserId && r.WorkshopEventId == rating.WorkshopEventId);
            if (existing != null)
                throw new WorkshopEventException("You have already rated this workshop. Use update rating.");

            rating.CreatedAt = DateTime.UtcNow;
            _context.WorkshopRatings.Add(rating);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateRating(int ratingId, int userId, WorkshopRating rating)
        {
            if (rating.RatingValue < 1 || rating.RatingValue > 5)
                throw new WorkshopEventException("Rating value must be between 1 and 5.");

            var existing = await _context.WorkshopRatings.FindAsync(ratingId);
            if (existing == null)
                return false;

            if (existing.UserId != userId)
                throw new WorkshopEventException("You can update only your own rating.");

            existing.RatingValue = rating.RatingValue;
            existing.ReviewText = rating.ReviewText;
            existing.CreatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
