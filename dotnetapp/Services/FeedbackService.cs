using dotnetapp.Data;
using dotnetapp.Models;
using Microsoft.EntityFrameworkCore;

namespace dotnetapp.Services
{
    public class FeedbackService
    {
        private readonly ApplicationDbContext _context;

        public FeedbackService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Feedback>> GetAllFeedbacks()
        {
            return await _context.Feedbacks
                .Include(f => f.User)
                .Include(f => f.Booking)
                    .ThenInclude(b => b.WorkshopEvent)
                .ToListAsync();
        }

        public async Task<IEnumerable<Feedback>> GetFeedbacksByUserId(int userId)
        {
            return await _context.Feedbacks
                .Where(f => f.UserId == userId)
                .Include(f => f.User)
                .Include(f => f.Booking)
                    .ThenInclude(b => b.WorkshopEvent)
                .ToListAsync();
        }

        public async Task<bool> RespondToFeedback(int feedbackId, string response)
        {
            var feedback = await _context.Feedbacks.FindAsync(feedbackId);
            if (feedback == null)
                return false;

            feedback.AdminResponse = response;
            feedback.ResponseDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AddFeedback(Feedback feedback)
        {
            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteFeedback(int feedbackId)
        {
            var feedback = await _context.Feedbacks.FindAsync(feedbackId);
            if (feedback == null)
                return false;

            _context.Feedbacks.Remove(feedback);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
