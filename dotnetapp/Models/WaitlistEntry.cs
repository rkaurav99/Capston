using System.ComponentModel.DataAnnotations;

namespace dotnetapp.Models
{
    public class WaitlistEntry
    {
        [Key]
        public int WaitlistId { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public int WorkshopEventId { get; set; }
        public WorkshopEvent? WorkshopEvent { get; set; }
        public DateTime JoinedAt { get; set; }
        public string Status { get; set; } = "Waiting";
    }
}
