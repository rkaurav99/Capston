using dotnetapp.Data;
using dotnetapp.Exceptions;
using dotnetapp.Models;
using Microsoft.EntityFrameworkCore;

namespace dotnetapp.Services
{
    public class BookingService
    {
        private readonly ApplicationDbContext _context;

        public BookingService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Booking>> GetAllBookings()
        {
            return await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.WorkshopEvent)
                .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetBookingsByUserId(int userId)
        {
            return await _context.Bookings
                .Where(b => b.UserId == userId)
                .Include(b => b.User)
                .Include(b => b.WorkshopEvent)
                .ToListAsync();
        }

        public async Task<bool> AddBooking(Booking booking)
        {
            var workshopEvent = await _context.WorkshopEvents.FindAsync(booking.WorkshopEventId);
            if (workshopEvent == null)
                throw new WorkshopEventException("Workshop event not found.");

            if (workshopEvent.Capacity <= 0)
                throw new WorkshopEventException("No more seats available for this event.");

            var existingBooking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.WorkshopEventId == booking.WorkshopEventId && b.UserId == booking.UserId);

            if (existingBooking != null)
                throw new WorkshopEventException("Booking with the same reference already exists.");

            _context.Bookings.Add(booking);
            workshopEvent.Capacity -= 1;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateBooking(int bookingId, Booking booking)
        {
            var existingBooking = await _context.Bookings.FindAsync(bookingId);
            if (existingBooking == null)
                return false;

            existingBooking.UserId = booking.UserId;
            existingBooking.WorkshopEventId = booking.WorkshopEventId;
            existingBooking.BookingStatus = booking.BookingStatus;
            existingBooking.BookingDate = booking.BookingDate;
            existingBooking.Gender = booking.Gender;
            existingBooking.Age = booking.Age;
            existingBooking.Occupation = booking.Occupation;
            existingBooking.City = booking.City;
            existingBooking.Proof = booking.Proof;
            existingBooking.AdditionalNotes = booking.AdditionalNotes;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteBooking(int bookingId)
        {
            var booking = await _context.Bookings.FindAsync(bookingId);
            if (booking == null)
                return false;

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
