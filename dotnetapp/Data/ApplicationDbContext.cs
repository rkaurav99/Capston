using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using dotnetapp.Models;

namespace dotnetapp.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public new DbSet<User> Users { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<WorkshopEvent> WorkshopEvents { get; set; }
        public DbSet<Feedback> Feedbacks { get; set; }
        public DbSet<WaitlistEntry> WaitlistEntries { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<WorkshopRating> WorkshopRatings { get; set; }
        public DbSet<FavoriteWorkshop> FavoriteWorkshops { get; set; }
    }
}
