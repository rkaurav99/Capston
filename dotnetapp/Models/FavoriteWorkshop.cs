using System.ComponentModel.DataAnnotations;

namespace dotnetapp.Models
{
    public class FavoriteWorkshop
    {
        [Key]
        public int FavoriteId { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public int WorkshopEventId { get; set; }
        public WorkshopEvent? WorkshopEvent { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
