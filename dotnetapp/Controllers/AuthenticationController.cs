using dotnetapp.Models;
using dotnetapp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace dotnetapp.Controllers
{
    [Route("api")]
    [ApiController]
    public class AuthenticationController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly NotificationService _notificationService;

        public AuthenticationController(IAuthService authService, NotificationService notificationService)
        {
            _authService = authService;
            _notificationService = notificationService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { message = "Invalid payload" });

                var (status, message) = await _authService.Login(model);
                if (status == 0)
                    return BadRequest(new { message });

                return Ok(new { token = message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User model)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { message = "Invalid payload" });

                var (status, message) = await _authService.Registration(model, model.UserRole);
                if (status == 0)
                    return BadRequest(new { message });

                return Ok(new { message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetProfile(int id)
        {
            try
            {
                var user = await _authService.GetUserById(id);
                if (user == null)
                    return NotFound(new { message = "User not found" });
                // Return safe profile (no raw password)
                return Ok(new { user.UserId, user.Username, user.Email, user.MobileNumber, user.UserRole });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateProfile(int id, [FromBody] User model)
        {
            try
            {
                var (status, message) = await _authService.UpdateUser(id, model);
                if (status == 0)
                    return BadRequest(new { message });

                if (!string.IsNullOrWhiteSpace(model.Password))
                {
                    await _notificationService.CreateNotification(
                        id,
                        "Password Changed",
                        "Your password has been changed successfully.",
                        "Security"
                    );
                }

                return Ok(new { message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }
    }
}
