using System.Security.Claims;
using dotnetapp.Models;
using dotnetapp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace dotnetapp.Controllers
{
    [Route("api")]
    [ApiController]
    public class WorkshopRatingController : ControllerBase
    {
        private readonly WorkshopRatingService _ratingService;

        public WorkshopRatingController(WorkshopRatingService ratingService)
        {
            _ratingService = ratingService;
        }

        [HttpGet("workshop-ratings/workshop/{workshopEventId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<WorkshopRating>>> GetByWorkshop(int workshopEventId)
        {
            try
            {
                var data = await _ratingService.GetRatingsByWorkshop(workshopEventId);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpGet("workshop-ratings/summary/{workshopEventId}")]
        [Authorize]
        public async Task<ActionResult> GetSummary(int workshopEventId)
        {
            try
            {
                var data = await _ratingService.GetRatingSummaryByWorkshop(workshopEventId);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpGet("workshop-ratings/summary")]
        [Authorize]
        public async Task<ActionResult> GetAllSummaries()
        {
            try
            {
                var data = await _ratingService.GetAllRatingSummaries();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpPost("workshop-ratings")]
        [Authorize(Roles = UserRoles.User)]
        public async Task<ActionResult> Add([FromBody] WorkshopRating rating)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId <= 0)
                    return Unauthorized(new { message = "Invalid user context" });

                rating.UserId = userId;
                var result = await _ratingService.AddRating(rating);
                if (result)
                    return Ok(new { message = "Rating added successfully" });

                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Failed to add rating" });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpPut("workshop-ratings/{ratingId}")]
        [Authorize(Roles = UserRoles.User)]
        public async Task<ActionResult> Update(int ratingId, [FromBody] WorkshopRating rating)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId <= 0)
                    return Unauthorized(new { message = "Invalid user context" });

                var result = await _ratingService.UpdateRating(ratingId, userId, rating);
                if (result)
                    return Ok(new { message = "Rating updated successfully" });

                return NotFound(new { message = "Rating not found" });
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
