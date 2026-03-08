using dotnetapp.Data;
using dotnetapp.Exceptions;
using dotnetapp.Models;
using Microsoft.EntityFrameworkCore;

namespace dotnetapp.Services
{
    public class WaitlistService
    {
        private readonly ApplicationDbContext _context;
        private readonly NotificationService _notificationService;

        public WaitlistService(ApplicationDbContext context, NotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<bool> JoinWaitlist(int userId, int workshopEventId)
        {
            var workshopEvent = await _context.WorkshopEvents.FindAsync(workshopEventId);
            if (workshopEvent == null)
                throw new WorkshopEventException("Workshop event not found.");

            if (workshopEvent.Capacity > 0)
                throw new WorkshopEventException("Seats are available. Please book the workshop directly.");

            var alreadyBooked = await _context.Bookings
                .AnyAsync(b => b.UserId == userId && b.WorkshopEventId == workshopEventId);
            if (alreadyBooked)
                throw new WorkshopEventException("You have already booked this workshop.");

            var existing = await _context.WaitlistEntries
                .FirstOrDefaultAsync(w => w.UserId == userId && w.WorkshopEventId == workshopEventId && w.Status != "Removed");
            if (existing != null)
                throw new WorkshopEventException("You have already joined this waitlist.");

            var entry = new WaitlistEntry
            {
                UserId = userId,
                WorkshopEventId = workshopEventId,
                JoinedAt = DateTime.UtcNow,
                Status = "Waiting"
            };

            _context.WaitlistEntries.Add(entry);
            await _context.SaveChangesAsync();

            await _notificationService.CreateNotification(
                userId,
                "Waitlist Joined",
                $"You have joined the waitlist for '{workshopEvent.EventName}'.",
                "Waitlist",
                workshopEventId
            );

            return true;
        }

        public async Task<IEnumerable<WaitlistEntry>> GetWaitlistByEvent(int workshopEventId)
        {
            return await _context.WaitlistEntries
                .Where(w => w.WorkshopEventId == workshopEventId)
                .Include(w => w.User)
                .Include(w => w.WorkshopEvent)
                .OrderBy(w => w.JoinedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<WaitlistEntry>> GetWaitlistByUser(int userId)
        {
            return await _context.WaitlistEntries
                .Where(w => w.UserId == userId)
                .Include(w => w.WorkshopEvent)
                .OrderByDescending(w => w.JoinedAt)
                .ToListAsync();
        }
    }
}
