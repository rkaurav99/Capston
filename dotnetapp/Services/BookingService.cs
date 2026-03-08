using dotnetapp.Data;
using dotnetapp.Exceptions;
using dotnetapp.Models;
using Microsoft.EntityFrameworkCore;

namespace dotnetapp.Services
{
    public class BookingService
    {
        private readonly ApplicationDbContext _context;
        private readonly NotificationService _notificationService;

        public BookingService(ApplicationDbContext context, NotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
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

            var userName = await _context.Users
                .Where(u => u.UserId == booking.UserId)
                .Select(u => u.Username)
                .FirstOrDefaultAsync();

            await _notificationService.CreateNotification(
                booking.UserId,
                "Booking Submitted",
                $"Your booking request for '{workshopEvent.EventName}' has been submitted.",
                "Booking",
                booking.WorkshopEventId
            );

            await NotifyAdmins(
                "New Booking Request",
                $"{(string.IsNullOrWhiteSpace(userName) ? "A user" : userName)} submitted booking #{booking.BookingId} for '{workshopEvent.EventName}'.",
                "AdminActivity",
                booking.BookingId
            );

            return true;
        }

        public async Task<bool> UpdateBooking(int bookingId, Booking booking)
        {
            var existingBooking = await _context.Bookings
                .Include(b => b.WorkshopEvent)
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);
            if (existingBooking == null)
                return false;

            var oldStatus = existingBooking.BookingStatus;

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

            if (oldStatus != existingBooking.BookingStatus)
            {
                var eventLabel = existingBooking.WorkshopEvent?.EventName ?? $"event #{existingBooking.WorkshopEventId}";
                var userLabel = existingBooking.User?.Username ?? $"User #{existingBooking.UserId}";

                if (existingBooking.BookingStatus == "Approved")
                {
                    if (oldStatus == "CancellationRequested")
                    {
                        await _notificationService.CreateNotification(
                            existingBooking.UserId,
                            "Cancellation Request Declined",
                            $"Your cancellation request for '{eventLabel}' was declined by admin. Your booking remains active.",
                            "Booking",
                            existingBooking.WorkshopEventId
                        );

                        await NotifyAdmins(
                            "Cancellation Request Rejected",
                            $"Cancellation request for booking #{existingBooking.BookingId} ({userLabel} - {eventLabel}) was rejected.",
                            "AdminActivity",
                            existingBooking.BookingId
                        );
                    }
                    else
                    {
                        await _notificationService.CreateNotification(
                            existingBooking.UserId,
                            "Booking Approved",
                            $"Your booking for '{eventLabel}' has been approved.",
                            "Booking",
                            existingBooking.WorkshopEventId
                        );

                        await NotifyAdmins(
                            "Booking Approved",
                            $"Booking #{existingBooking.BookingId} for {userLabel} was approved.",
                            "AdminActivity",
                            existingBooking.BookingId
                        );
                    }
                }
                else if (existingBooking.BookingStatus == "Rejected")
                {
                    await _notificationService.CreateNotification(
                        existingBooking.UserId,
                        "Booking Rejected",
                        $"Your booking for '{eventLabel}' was rejected.",
                        "Booking",
                        existingBooking.WorkshopEventId
                    );

                    await NotifyAdmins(
                        "Booking Rejected",
                        $"Booking #{existingBooking.BookingId} for {userLabel} was rejected.",
                        "AdminActivity",
                        existingBooking.BookingId
                    );
                }
                else if (existingBooking.BookingStatus == "Cancelled")
                {
                    if (oldStatus == "CancellationRequested")
                    {
                        await _notificationService.CreateNotification(
                            existingBooking.UserId,
                            "Cancellation Request Approved",
                            $"Your cancellation request for '{eventLabel}' has been approved.",
                            "Booking",
                            existingBooking.WorkshopEventId
                        );

                        await NotifyAdmins(
                            "Cancellation Approved",
                            $"Cancellation request for booking #{existingBooking.BookingId} ({userLabel} - {eventLabel}) was approved.",
                            "AdminActivity",
                            existingBooking.BookingId
                        );
                    }
                    else
                    {
                        await _notificationService.CreateNotification(
                            existingBooking.UserId,
                            "Booking Cancelled",
                            $"Your booking for '{eventLabel}' has been cancelled by admin.",
                            "Booking",
                            existingBooking.WorkshopEventId
                        );

                        await NotifyAdmins(
                            "Booking Cancelled",
                            $"Booking #{existingBooking.BookingId} for {userLabel} was cancelled.",
                            "AdminActivity",
                            existingBooking.BookingId
                        );
                    }

                    if (oldStatus != "Cancelled")
                    {
                        await ReleaseSeatAndPromoteWaitlist(existingBooking.WorkshopEventId);
                    }
                }
            }

            return true;
        }

        public async Task<bool> RequestCancelBooking(int bookingId)
        {
            var booking = await _context.Bookings.FindAsync(bookingId);
            if (booking == null)
                return false;

            if (booking.BookingStatus == "Cancelled")
                throw new WorkshopEventException("Booking is already cancelled.");

            if (booking.BookingStatus == "CancellationRequested")
                throw new WorkshopEventException("Cancellation request is already pending.");

            booking.BookingStatus = "CancellationRequested";
            await _context.SaveChangesAsync();

            var userName = await _context.Users
                .Where(u => u.UserId == booking.UserId)
                .Select(u => u.Username)
                .FirstOrDefaultAsync();

            var eventName = await _context.WorkshopEvents
                .Where(w => w.WorkshopEventId == booking.WorkshopEventId)
                .Select(w => w.EventName)
                .FirstOrDefaultAsync();

            var eventLabel = string.IsNullOrWhiteSpace(eventName) ? $"event #{booking.WorkshopEventId}" : eventName;

            await _notificationService.CreateNotification(
                booking.UserId,
                "Cancellation Requested",
                $"Your cancellation request for '{eventLabel}' is pending admin approval.",
                "Booking",
                booking.WorkshopEventId
            );

            await NotifyAdmins(
                "Cancellation Request",
                $"{(string.IsNullOrWhiteSpace(userName) ? "A user" : userName)} requested cancellation for booking #{booking.BookingId} ({eventLabel}).",
                "AdminActivity",
                booking.BookingId
            );

            return true;
        }

        public async Task<bool> DeleteBooking(int bookingId)
        {
            var booking = await _context.Bookings.FindAsync(bookingId);
            if (booking == null)
                return false;

            var workshopEventId = booking.WorkshopEventId;
            var userId = booking.UserId;

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();

            if (booking.BookingStatus != "Cancelled")
            {
                await ReleaseSeatAndPromoteWaitlist(workshopEventId);
            }

            await _notificationService.CreateNotification(
                userId,
                "Booking Deleted",
                $"Your booking for event #{workshopEventId} has been deleted.",
                "Booking",
                workshopEventId
            );

            await NotifyAdmins(
                "Booking Deleted",
                $"Booking #{bookingId} was deleted by admin.",
                "AdminActivity",
                bookingId
            );

            return true;
        }

        private async Task NotifyAdmins(string title, string message, string type, int? relatedEntityId = null)
        {
            var adminIds = await _context.Users
                .Where(u => u.UserRole == UserRoles.Admin)
                .Select(u => u.UserId)
                .ToListAsync();

            foreach (var adminId in adminIds)
            {
                await _notificationService.CreateNotification(adminId, title, message, type, relatedEntityId);
            }
        }

        private async Task ReleaseSeatAndPromoteWaitlist(int workshopEventId)
        {
            var workshopEvent = await _context.WorkshopEvents.FindAsync(workshopEventId);
            if (workshopEvent == null)
                return;

            workshopEvent.Capacity += 1;
            await _context.SaveChangesAsync();

            if (workshopEvent.Capacity <= 0)
                return;

            var waitlistEntry = await _context.WaitlistEntries
                .Where(w => w.WorkshopEventId == workshopEventId && w.Status == "Waiting")
                .OrderBy(w => w.JoinedAt)
                .FirstOrDefaultAsync();

            if (waitlistEntry == null)
                return;

            waitlistEntry.Status = "Promoted";
            await _context.SaveChangesAsync();

            await _notificationService.CreateNotification(
                waitlistEntry.UserId,
                "Waitlist Promoted",
                $"A seat is now available for event #{workshopEventId}. You have been promoted from the waitlist.",
                "Waitlist",
                workshopEventId
            );
        }
    }
}
