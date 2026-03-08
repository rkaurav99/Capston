using dotnetapp.Data;
using dotnetapp.Exceptions;
using dotnetapp.Models;
using Microsoft.EntityFrameworkCore;

namespace dotnetapp.Services
{
    public class FavoriteWorkshopService
    {
        private readonly ApplicationDbContext _context;

        public FavoriteWorkshopService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> AddFavorite(int userId, int workshopEventId)
        {
            var workshopEvent = await _context.WorkshopEvents.FindAsync(workshopEventId);
            if (workshopEvent == null)
                throw new WorkshopEventException("Workshop event not found.");

            var existing = await _context.FavoriteWorkshops
                .FirstOrDefaultAsync(f => f.UserId == userId && f.WorkshopEventId == workshopEventId);
            if (existing != null)
                throw new WorkshopEventException("Workshop already added to favorites.");

            _context.FavoriteWorkshops.Add(new FavoriteWorkshop
            {
                UserId = userId,
                WorkshopEventId = workshopEventId,
                CreatedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveFavorite(int userId, int workshopEventId)
        {
            var existing = await _context.FavoriteWorkshops
                .FirstOrDefaultAsync(f => f.UserId == userId && f.WorkshopEventId == workshopEventId);
            if (existing == null)
                return false;

            _context.FavoriteWorkshops.Remove(existing);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsFavorite(int userId, int workshopEventId)
        {
            return await _context.FavoriteWorkshops
                .AnyAsync(f => f.UserId == userId && f.WorkshopEventId == workshopEventId);
        }

        public async Task<IEnumerable<FavoriteWorkshop>> GetFavoritesByUser(int userId)
        {
            return await _context.FavoriteWorkshops
                .Where(f => f.UserId == userId)
                .Include(f => f.WorkshopEvent)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }
    }
}
