using System.ComponentModel.DataAnnotations;

namespace dotnetapp.Models
{
    public class WorkshopRating
    {
        [Key]
        public int RatingId { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public int WorkshopEventId { get; set; }
        public WorkshopEvent? WorkshopEvent { get; set; }
        public int RatingValue { get; set; }
        public string? ReviewText { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
