using System.ComponentModel.DataAnnotations;

namespace dotnetapp.Models
{
    public class Feedback
    {
        [Key]
        public int FeedbackId { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public int? BookingId { get; set; }
        public Booking? Booking { get; set; }
        public string FeedbackText { get; set; }
        public DateTime Date { get; set; }
        public string? AdminResponse { get; set; }
        public DateTime? ResponseDate { get; set; }
    }
}
