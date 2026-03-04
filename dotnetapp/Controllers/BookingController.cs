using dotnetapp.Models;
using dotnetapp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace dotnetapp.Controllers
{
    [Route("api")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly BookingService _bookingService;

        public BookingController(BookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpGet("bookings")]
        [Authorize(Roles = UserRoles.Admin)]
        public async Task<ActionResult<IEnumerable<Booking>>> GetAllBookings()
        {
            try
            {
                var bookings = await _bookingService.GetAllBookings();
                return Ok(bookings);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("bookings/user/{userId}")]
        [Authorize(Roles = UserRoles.User)]
        public async Task<ActionResult<Booking>> GetBookingsByUserId(int userId)
        {
            try
            {
                var bookings = await _bookingService.GetBookingsByUserId(userId);
                if (bookings == null || !bookings.Any())
                    return NotFound(new { message = "Booking not found" });

                return Ok(bookings);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost("booking")]
        [Authorize]
        public async Task<ActionResult> AddBooking([FromBody] Booking booking)
        {
            try
            {
                var result = await _bookingService.AddBooking(booking);
                if (result)
                    return Ok(new { message = "Booking added successfully" });

                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Failed to add booking" });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpPut("booking/{bookingId}")]
        [Authorize]
        public async Task<ActionResult> UpdateBooking(int bookingId, [FromBody] Booking booking)
        {
            try
            {
                var result = await _bookingService.UpdateBooking(bookingId, booking);
                if (result)
                    return Ok(new { message = "Booking updated successfully" });

                return NotFound(new { message = "Booking not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpDelete("booking/{bookingId}")]
        [Authorize(Roles = UserRoles.Admin)]
        public async Task<ActionResult> DeleteBooking(int bookingId)
        {
            try
            {
                var result = await _bookingService.DeleteBooking(bookingId);
                if (result)
                    return Ok(new { message = "Booking deleted successfully" });

                return NotFound(new { message = "Booking not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }
    }
}
