using System.ComponentModel.DataAnnotations;

namespace dotnetapp.Models
{
    public class Booking
    {
        [Key]
        public int BookingId { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public int WorkshopEventId { get; set; }
        public WorkshopEvent? WorkshopEvent { get; set; }
        public string BookingStatus { get; set; }
        public DateTime BookingDate { get; set; }
        public string Gender { get; set; }
        public int Age { get; set; }
        public string Occupation { get; set; }
        public string City { get; set; }
        public string Proof { get; set; }
        public string? AdditionalNotes { get; set; }
        public bool Is24HourReminderSent { get; set; }
        public bool Is6HourReminderSent { get; set; }
    }
}
