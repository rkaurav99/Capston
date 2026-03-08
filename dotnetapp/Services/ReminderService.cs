using dotnetapp.Data;
using dotnetapp.Models;
using Microsoft.EntityFrameworkCore;

namespace dotnetapp.Services
{
    public class ReminderService
    {
        private readonly ApplicationDbContext _context;

        public ReminderService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<int> ProcessReminders()
        {
            var now = DateTime.UtcNow;
            var bookings = await _context.Bookings
                .Include(b => b.WorkshopEvent)
                .Where(b => b.WorkshopEvent != null && b.BookingStatus != "Cancelled")
                .ToListAsync();

            var createdCount = 0;
            foreach (var booking in bookings)
            {
                var eventStart = booking.WorkshopEvent!.StartDateTime;
                var hoursToStart = (eventStart - now).TotalHours;

                if (!booking.Is24HourReminderSent && hoursToStart > 0 && hoursToStart <= 24)
                {
                    _context.Notifications.Add(new Notification
                    {
                        UserId = booking.UserId,
                        Title = "Workshop Reminder",
                        Message = $"Your workshop '{booking.WorkshopEvent.EventName}' starts within 24 hours.",
                        Type = "Reminder",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow,
                        RelatedEntityId = booking.WorkshopEventId
                    });
                    booking.Is24HourReminderSent = true;
                    createdCount++;
                }

                if (!booking.Is6HourReminderSent && hoursToStart > 0 && hoursToStart <= 6)
                {
                    _context.Notifications.Add(new Notification
                    {
                        UserId = booking.UserId,
                        Title = "Workshop Reminder",
                        Message = $"Your workshop '{booking.WorkshopEvent.EventName}' starts within 6 hours.",
                        Type = "Reminder",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow,
                        RelatedEntityId = booking.WorkshopEventId
                    });
                    booking.Is6HourReminderSent = true;
                    createdCount++;
                }
            }

            await _context.SaveChangesAsync();
            return createdCount;
        }
    }
}
