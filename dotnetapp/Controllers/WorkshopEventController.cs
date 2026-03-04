using dotnetapp.Models;
using dotnetapp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace dotnetapp.Controllers
{
    [Route("api")]
    [ApiController]
    public class WorkshopEventController : ControllerBase
    {
        private readonly WorkshopEventService _workshopEventService;

        public WorkshopEventController(WorkshopEventService workshopEventService)
        {
            _workshopEventService = workshopEventService;
        }

        [HttpGet("workshop-events")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<WorkshopEvent>>> GetAllWorkshopEvents()
        {
            try
            {
                var workshopEvents = await _workshopEventService.GetAllWorkshopEvents();
                return Ok(workshopEvents);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("workshop-event/{workshopEventId}")]
        [Authorize]
        public async Task<ActionResult<WorkshopEvent>> GetWorkshopEventById(int workshopEventId)
        {
            try
            {
                var workshopEvent = await _workshopEventService.GetWorkshopEventById(workshopEventId);
                if (workshopEvent == null)
                    return NotFound(new { message = "Workshop event not found" });

                return Ok(workshopEvent);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost("workshop-event")]
        [Authorize(Roles = UserRoles.Admin)]
        public async Task<ActionResult> AddWorkshopEvent([FromBody] WorkshopEvent workshopEvent)
        {
            try
            {
                var result = await _workshopEventService.AddWorkshopEvent(workshopEvent);
                if (result)
                    return Ok(new { message = "Workshop event added successfully" });

                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Failed to add workshop event" });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpPut("workshop-event/{workshopEventId}")]
        [Authorize(Roles = UserRoles.Admin)]
        public async Task<ActionResult> UpdateWorkshopEvent(int workshopEventId, [FromBody] WorkshopEvent workshopEvent)
        {
            try
            {
                var result = await _workshopEventService.UpdateWorkshopEvent(workshopEventId, workshopEvent);
                if (result)
                    return Ok(new { message = "Workshop event updated successfully" });

                return NotFound(new { message = "Workshop event not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpDelete("workshop-event/{workshopEventId}")]
        [Authorize(Roles = UserRoles.Admin)]
        public async Task<ActionResult> DeleteWorkshopEvent(int workshopEventId)
        {
            try
            {
                var result = await _workshopEventService.DeleteWorkshopEvent(workshopEventId);
                if (result)
                    return Ok(new { message = "Workshop event deleted successfully" });

                return NotFound(new { message = "Workshop event not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }
    }
}
