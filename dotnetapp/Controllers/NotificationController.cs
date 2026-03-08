using System.Security.Claims;
using dotnetapp.Models;
using dotnetapp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace dotnetapp.Controllers
{
    [Route("api")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly NotificationService _notificationService;
        private readonly ReminderService _reminderService;

        public NotificationController(NotificationService notificationService, ReminderService reminderService)
        {
            _notificationService = notificationService;
            _reminderService = reminderService;
        }

        [HttpGet("notifications")]
        public async Task<ActionResult<IEnumerable<Notification>>> GetMyNotifications()
        {
            try
            {
                await _reminderService.ProcessReminders();
                var userId = GetCurrentUserId();
                if (userId <= 0)
                    return Unauthorized(new { message = "Invalid user context" });

                var notifications = await _notificationService.GetByUser(userId);
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpGet("notifications/unread-count")]
        public async Task<ActionResult> GetUnreadCount()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId <= 0)
                    return Unauthorized(new { message = "Invalid user context" });

                var count = await _notificationService.GetUnreadCount(userId);
                return Ok(new { unreadCount = count });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpPut("notifications/{notificationId}/mark-read")]
        public async Task<ActionResult> MarkRead(int notificationId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId <= 0)
                    return Unauthorized(new { message = "Invalid user context" });

                var result = await _notificationService.MarkRead(userId, notificationId);
                if (!result)
                    return NotFound(new { message = "Notification not found" });

                return Ok(new { message = "Notification marked as read" });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpPut("notifications/mark-all-read")]
        public async Task<ActionResult> MarkAllRead()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId <= 0)
                    return Unauthorized(new { message = "Invalid user context" });

                var marked = await _notificationService.MarkAllRead(userId);
                return Ok(new { message = "Notifications marked as read", count = marked });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpPost("notifications/process-reminders")]
        [Authorize(Roles = UserRoles.Admin)]
        public async Task<ActionResult> ProcessReminders()
        {
            try
            {
                var created = await _reminderService.ProcessReminders();
                return Ok(new { message = "Reminder processing complete", created });
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
