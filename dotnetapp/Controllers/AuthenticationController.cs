using System;
using System.Text;
using dotnetapp.Models;
using dotnetapp.Services;
using Microsoft.AspNetCore.Mvc;

namespace dotnetapp.Controllers
{
    [Route("api")]
    [ApiController]
    public class AuthenticationController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthenticationController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Decode a Base64-encoded string back to plain text.
        /// </summary>
        private static string DecodeBase64(string encoded)
        {
            var bytes = Convert.FromBase64String(encoded);
            return Encoding.UTF8.GetString(bytes);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { message = "Invalid payload" });

                // Decode Base64-encoded credentials
                model.Email = DecodeBase64(model.Email);
                model.Password = DecodeBase64(model.Password);

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

                // Decode Base64-encoded credentials
                model.Email = DecodeBase64(model.Email);
                model.Password = DecodeBase64(model.Password);

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
    }
}
