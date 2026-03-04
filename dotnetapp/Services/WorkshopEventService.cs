using dotnetapp.Data;
using dotnetapp.Exceptions;
using dotnetapp.Models;
using Microsoft.EntityFrameworkCore;

namespace dotnetapp.Services
{
    public class WorkshopEventService
    {
        private readonly ApplicationDbContext _context;

        public WorkshopEventService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<WorkshopEvent>> GetAllWorkshopEvents()
        {
            return await _context.WorkshopEvents.ToListAsync();
        }

        public async Task<WorkshopEvent> GetWorkshopEventById(int workshopEventId)
        {
            return await _context.WorkshopEvents.FindAsync(workshopEventId);
        }

        public async Task<bool> AddWorkshopEvent(WorkshopEvent workshopEvent)
        {
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
