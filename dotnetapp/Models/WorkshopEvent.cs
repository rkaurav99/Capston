using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnetapp.Models
{
    public class WorkshopEvent
    {
        [Key]
        public int WorkshopEventId { get; set; }
        public string EventName { get; set; }
        public string OrganizerName { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public int Capacity { get; set; }

        [NotMapped]
        public string Status
        {
            get
            {
                var now = DateTime.UtcNow;
                if (now < StartDateTime)
                    return "Upcoming";
                if (now <= EndDateTime)
                    return "Live";
                return "Completed";
            }
        }
    }
}
