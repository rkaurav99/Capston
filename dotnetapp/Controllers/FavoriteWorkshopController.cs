using dotnetapp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace dotnetapp.Controllers
{
    [Route("api")]
    [ApiController]
    [Authorize(Roles = dotnetapp.Models.UserRoles.User)]
    public class FavoriteWorkshopController : ControllerBase
    {
        private readonly FavoriteWorkshopService _favoriteService;

        public FavoriteWorkshopController(FavoriteWorkshopService favoriteService)
        {
            _favoriteService = favoriteService;
        }

        [HttpPost("favorites/{workshopEventId}")]
        public async Task<ActionResult> AddFavorite(int workshopEventId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId <= 0)
                    return Unauthorized(new { message = "Invalid user context" });

                var result = await _favoriteService.AddFavorite(userId, workshopEventId);
                if (result)
                    return Ok(new { message = "Added to favorites" });

                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Failed to add favorite" });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpDelete("favorites/{workshopEventId}")]
        public async Task<ActionResult> RemoveFavorite(int workshopEventId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId <= 0)
                    return Unauthorized(new { message = "Invalid user context" });

                var result = await _favoriteService.RemoveFavorite(userId, workshopEventId);
                if (result)
                    return Ok(new { message = "Removed from favorites" });

                return NotFound(new { message = "Favorite not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpGet("favorites")]
        public async Task<ActionResult> GetFavorites()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId <= 0)
                    return Unauthorized(new { message = "Invalid user context" });

                var favorites = await _favoriteService.GetFavoritesByUser(userId);
                return Ok(favorites);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpGet("favorites/{workshopEventId}/is-favorite")]
        public async Task<ActionResult> IsFavorite(int workshopEventId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId <= 0)
                    return Unauthorized(new { message = "Invalid user context" });

                var isFavorite = await _favoriteService.IsFavorite(userId, workshopEventId);
                return Ok(new { isFavorite });
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
