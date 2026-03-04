using dotnetapp.Models;
using dotnetapp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace dotnetapp.Controllers
{
    [Route("api")]
    [ApiController]
    public class FeedbackController : ControllerBase
    {
        private readonly FeedbackService _feedbackService;

        public FeedbackController(FeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
        }

        [HttpGet("feedback")]
        [Authorize(Roles = UserRoles.Admin)]
        public async Task<ActionResult<IEnumerable<Feedback>>> GetAllFeedbacks()
        {
            try
            {
                var feedbacks = await _feedbackService.GetAllFeedbacks();
                return Ok(feedbacks);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("feedback/user/{userId}")]
        [Authorize(Roles = UserRoles.User)]
        public async Task<ActionResult<IEnumerable<Feedback>>> GetFeedbacksByUserId(int userId)
        {
            try
            {
                var feedbacks = await _feedbackService.GetFeedbacksByUserId(userId);
                return Ok(feedbacks);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost("feedback")]
        [Authorize(Roles = UserRoles.User)]
        public async Task<ActionResult> AddFeedback([FromBody] Feedback feedback)
        {
            try
            {
                var result = await _feedbackService.AddFeedback(feedback);
                if (result)
                    return Ok(new { message = "Feedback added successfully" });

                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Failed to add feedback" });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpDelete("feedback/{feedbackId}")]
        [Authorize(Roles = UserRoles.User)]
        public async Task<ActionResult> DeleteFeedback(int feedbackId)
        {
            try
            {
                var result = await _feedbackService.DeleteFeedback(feedbackId);
                if (result)
                    return Ok(new { message = "Feedback deleted successfully" });

                return NotFound(new { message = "Cannot find any feedback" });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }
    }
}
