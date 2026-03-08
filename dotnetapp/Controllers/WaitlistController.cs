using System.Security.Claims;
using dotnetapp.Models;
using dotnetapp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace dotnetapp.Controllers
{
    [Route("api")]
    [ApiController]
    public class WaitlistController : ControllerBase
    {
        private readonly WaitlistService _waitlistService;

        public WaitlistController(WaitlistService waitlistService)
        {
            _waitlistService = waitlistService;
        }

        [HttpPost("waitlist/join")]
        [Authorize(Roles = UserRoles.User)]
        public async Task<ActionResult> JoinWaitlist([FromBody] WaitlistEntry request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId <= 0)
                    return Unauthorized(new { message = "Invalid user context" });

                var result = await _waitlistService.JoinWaitlist(userId, request.WorkshopEventId);
                if (result)
                    return Ok(new { message = "Joined waitlist successfully" });

                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Failed to join waitlist" });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpGet("waitlist/event/{workshopEventId}")]
        [Authorize(Roles = UserRoles.Admin)]
        public async Task<ActionResult<IEnumerable<WaitlistEntry>>> GetByEvent(int workshopEventId)
        {
            try
            {
                var data = await _waitlistService.GetWaitlistByEvent(workshopEventId);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpGet("waitlist/user/{userId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<WaitlistEntry>>> GetByUser(int userId)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var role = User.FindFirstValue(ClaimTypes.Role);
                if (role != UserRoles.Admin && currentUserId != userId)
                    return Forbid();

                var data = await _waitlistService.GetWaitlistByUser(userId);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }
    }
}
