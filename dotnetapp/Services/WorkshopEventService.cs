using dotnetapp.Data;
using dotnetapp.Exceptions;
using dotnetapp.Models;
using Microsoft.EntityFrameworkCore;

namespace dotnetapp.Services
{
    public class WorkshopEventService
    {
        private readonly ApplicationDbContext _context;
        private readonly NotificationService _notificationService;

        public WorkshopEventService(ApplicationDbContext context, NotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<IEnumerable<WorkshopEvent>> GetAllWorkshopEvents()
        {
            return await _context.WorkshopEvents.ToListAsync();
        }

        public async Task<WorkshopEvent> GetWorkshopEventById(int workshopEventId)
        {
            return await _context.WorkshopEvents.FindAsync(workshopEventId);
        }

        private void ValidateWorkshopEvent(WorkshopEvent e)
        {
            if (string.IsNullOrWhiteSpace(e.EventName))
                throw new WorkshopEventException("Event name is required.");
            if (string.IsNullOrWhiteSpace(e.OrganizerName))
                throw new WorkshopEventException("Organizer name is required.");
            if (string.IsNullOrWhiteSpace(e.Category))
                throw new WorkshopEventException("Category is required.");
            if (string.IsNullOrWhiteSpace(e.Description))
                throw new WorkshopEventException("Description is required.");
            if (string.IsNullOrWhiteSpace(e.Location))
                throw new WorkshopEventException("Location is required.");
            if (e.StartDateTime < DateTime.UtcNow)
                throw new WorkshopEventException("Start date cannot be earlier than the current date.");
            if (e.EndDateTime <= e.StartDateTime)
                throw new WorkshopEventException("End date must be later than the start date.");
            if (e.Capacity <= 0)
                throw new WorkshopEventException("Capacity must be greater than zero.");
        }

        public async Task<bool> AddWorkshopEvent(WorkshopEvent workshopEvent)
        {
            ValidateWorkshopEvent(workshopEvent);

            var existingEvent = await _context.WorkshopEvents
                .FirstOrDefaultAsync(e => e.EventName == workshopEvent.EventName);

            if (existingEvent != null)
                throw new WorkshopEventException("Event with the same name already exists");

            _context.WorkshopEvents.Add(workshopEvent);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateWorkshopEvent(int workshopEventId, WorkshopEvent workshopEvent)
        {
            ValidateWorkshopEvent(workshopEvent);

            var existingEvent = await _context.WorkshopEvents.FindAsync(workshopEventId);
            if (existingEvent == null)
                return false;

            var duplicateEvent = await _context.WorkshopEvents
                .FirstOrDefaultAsync(e => e.EventName == workshopEvent.EventName && e.WorkshopEventId != workshopEventId);

            if (duplicateEvent != null)
                throw new WorkshopEventException("Event with the same name already exists");

            existingEvent.EventName = workshopEvent.EventName;
            existingEvent.OrganizerName = workshopEvent.OrganizerName;
            existingEvent.Category = workshopEvent.Category;
            existingEvent.Description = workshopEvent.Description;
            existingEvent.Location = workshopEvent.Location;
            existingEvent.StartDateTime = workshopEvent.StartDateTime;
            existingEvent.EndDateTime = workshopEvent.EndDateTime;
            existingEvent.Capacity = workshopEvent.Capacity;

            await _context.SaveChangesAsync();

            var impactedUserIds = await _context.Bookings
                .Where(b => b.WorkshopEventId == workshopEventId && b.BookingStatus != "Cancelled")
                .Select(b => b.UserId)
                .Distinct()
                .ToListAsync();

            foreach (var userId in impactedUserIds)
            {
                await _notificationService.CreateNotification(
                    userId,
                    "Workshop Updated",
                    $"The workshop '{existingEvent.EventName}' has been updated. Please review the latest details.",
                    "Workshop",
                    workshopEventId
                );
            }

            return true;
        }

        public async Task<bool> DeleteWorkshopEvent(int workshopEventId)
        {
            var workshopEvent = await _context.WorkshopEvents.FindAsync(workshopEventId);
            if (workshopEvent == null)
                return false;

            var isReferenced = await _context.Bookings
                .AnyAsync(b => b.WorkshopEventId == workshopEventId);

            if (isReferenced)
                throw new WorkshopEventException("Workshop event cannot be deleted, it is referenced in bookings");

            _context.WorkshopEvents.Remove(workshopEvent);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
