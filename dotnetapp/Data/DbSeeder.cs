using dotnetapp.Models;
using Microsoft.EntityFrameworkCore;

namespace dotnetapp.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            // ── WorkshopEvents ────────────────────────────────────────────────
            if (!await context.WorkshopEvents.AnyAsync())
            {
                var events = new List<WorkshopEvent>
                {
                    new WorkshopEvent
                    {
                        EventName       = "Full-Stack Web Development Bootcamp",
                        OrganizerName   = "TechSphere Academy",
                        Category        = "Technology",
                        Description     = "An intensive hands-on bootcamp covering Angular, .NET Core, SQL Server, and deployment on Azure. Ideal for developers looking to build production-ready full-stack applications.",
                        Location        = "Chennai Innovation Hub, Chennai",
                        StartDateTime   = new DateTime(2026, 4, 10, 9, 0, 0),
                        EndDateTime     = new DateTime(2026, 4, 12, 18, 0, 0),
                        Capacity        = 60
                    },
                    new WorkshopEvent
                    {
                        EventName       = "UI/UX Design Thinking Workshop",
                        OrganizerName   = "DesignLab India",
                        Category        = "Design",
                        Description     = "Learn human-centered design principles, wireframing with Figma, and usability testing methodologies used by top product teams.",
                        Location        = "Bengaluru Design Studio, Bengaluru",
                        StartDateTime   = new DateTime(2026, 4, 18, 10, 0, 0),
                        EndDateTime     = new DateTime(2026, 4, 18, 17, 0, 0),
                        Capacity        = 40
                    },
                    new WorkshopEvent
                    {
                        EventName       = "Data Science & Machine Learning Essentials",
                        OrganizerName   = "DataMinds Institute",
                        Category        = "Data Science",
                        Description     = "Explore Python for data analysis, scikit-learn for ML models, and Power BI for visualisation. Real-world datasets used throughout.",
                        Location        = "Hyderabad Tech Park, Hyderabad",
                        StartDateTime   = new DateTime(2026, 5, 2, 9, 30, 0),
                        EndDateTime     = new DateTime(2026, 5, 3, 17, 30, 0),
                        Capacity        = 50
                    },
                    new WorkshopEvent
                    {
                        EventName       = "Agile & Scrum Master Certification Prep",
                        OrganizerName   = "AgileEdge Consulting",
                        Category        = "Project Management",
                        Description     = "A one-day workshop on Agile values, Scrum ceremonies, sprint planning, and retrospective techniques with mock CSM exam practice.",
                        Location        = "Mumbai Business Centre, Mumbai",
                        StartDateTime   = new DateTime(2026, 5, 15, 9, 0, 0),
                        EndDateTime     = new DateTime(2026, 5, 15, 18, 0, 0),
                        Capacity        = 35
                    },
                    new WorkshopEvent
                    {
                        EventName       = "Cloud Architecture on AWS",
                        OrganizerName   = "CloudPros India",
                        Category        = "Cloud Computing",
                        Description     = "Deep dive into AWS core services — EC2, S3, RDS, Lambda, and CloudFormation. Hands-on labs included. Targeted at developers and DevOps engineers.",
                        Location        = "Pune IT Hub, Pune",
                        StartDateTime   = new DateTime(2026, 6, 6, 9, 0, 0),
                        EndDateTime     = new DateTime(2026, 6, 7, 17, 0, 0),
                        Capacity        = 45
                    },
                    new WorkshopEvent
                    {
                        EventName       = "Cybersecurity Fundamentals",
                        OrganizerName   = "SecureNet Academy",
                        Category        = "Security",
                        Description     = "Introduction to ethical hacking, network security, OWASP Top 10 vulnerabilities, and penetration testing using Kali Linux.",
                        Location        = "Delhi Cyber Hub, Delhi",
                        StartDateTime   = new DateTime(2026, 6, 20, 10, 0, 0),
                        EndDateTime     = new DateTime(2026, 6, 21, 17, 0, 0),
                        Capacity        = 30
                    }
                };

                context.WorkshopEvents.AddRange(events);
                await context.SaveChangesAsync();
            }

            // ── Users ─────────────────────────────────────────────────────────
            if (!await context.Users.AnyAsync())
            {
                var users = new List<User>
                {
                    new User
                    {
                        Username     = "admin_raj",
                        Email        = "admin@workshop.com",
                        Password     = "Admin@123",
                        MobileNumber = "9876543210",
                        UserRole     = "Admin",
                        SecretKey    = "ADMIN2026"
                    },
                    new User
                    {
                        Username     = "priya_sharma",
                        Email        = "priya@example.com",
                        Password     = "User@123",
                        MobileNumber = "9123456780",
                        UserRole     = "User",
                        SecretKey    = null
                    },
                    new User
                    {
                        Username     = "arjun_verma",
                        Email        = "arjun@example.com",
                        Password     = "User@123",
                        MobileNumber = "9234567891",
                        UserRole     = "User",
                        SecretKey    = null
                    },
                    new User
                    {
                        Username     = "meena_pillai",
                        Email        = "meena@example.com",
                        Password     = "User@123",
                        MobileNumber = "9345678902",
                        UserRole     = "User",
                        SecretKey    = null
                    }
                };

                context.Users.AddRange(users);
                await context.SaveChangesAsync();
            }

            // ── Bookings ──────────────────────────────────────────────────────
            if (!await context.Bookings.AnyAsync())
            {
                // Fetch seeded IDs
                var user1  = await context.Users.FirstAsync(u => u.Email == "priya@example.com");
                var user2  = await context.Users.FirstAsync(u => u.Email == "arjun@example.com");
                var user3  = await context.Users.FirstAsync(u => u.Email == "meena@example.com");

                var event1 = await context.WorkshopEvents.FirstAsync(e => e.EventName == "Full-Stack Web Development Bootcamp");
                var event2 = await context.WorkshopEvents.FirstAsync(e => e.EventName == "UI/UX Design Thinking Workshop");
                var event3 = await context.WorkshopEvents.FirstAsync(e => e.EventName == "Data Science & Machine Learning Essentials");
                var event4 = await context.WorkshopEvents.FirstAsync(e => e.EventName == "Agile & Scrum Master Certification Prep");
                var event5 = await context.WorkshopEvents.FirstAsync(e => e.EventName == "Cloud Architecture on AWS");

                var bookings = new List<Booking>
                {
                    new Booking
                    {
                        UserId          = user1.UserId,
                        WorkshopEventId = event1.WorkshopEventId,
                        BookingStatus   = "Confirmed",
                        BookingDate     = new DateTime(2026, 3, 5),
                        Gender          = "Female",
                        Age             = 26,
                        Occupation      = "Software Developer",
                        City            = "Chennai",
                        Proof           = "Aadhar",
                        AdditionalNotes = "Interested in backend sessions."
                    },
                    new Booking
                    {
                        UserId          = user1.UserId,
                        WorkshopEventId = event2.WorkshopEventId,
                        BookingStatus   = "Confirmed",
                        BookingDate     = new DateTime(2026, 3, 6),
                        Gender          = "Female",
                        Age             = 26,
                        Occupation      = "Software Developer",
                        City            = "Chennai",
                        Proof           = "Passport",
                        AdditionalNotes = "Would love Figma hands-on time."
                    },
                    new Booking
                    {
                        UserId          = user2.UserId,
                        WorkshopEventId = event3.WorkshopEventId,
                        BookingStatus   = "Confirmed",
                        BookingDate     = new DateTime(2026, 3, 6),
                        Gender          = "Male",
                        Age             = 29,
                        Occupation      = "Data Analyst",
                        City            = "Hyderabad",
                        Proof           = "Aadhar",
                        AdditionalNotes = null
                    },
                    new Booking
                    {
                        UserId          = user2.UserId,
                        WorkshopEventId = event4.WorkshopEventId,
                        BookingStatus   = "Pending",
                        BookingDate     = new DateTime(2026, 3, 6),
                        Gender          = "Male",
                        Age             = 29,
                        Occupation      = "Data Analyst",
                        City            = "Mumbai",
                        Proof           = "Voter ID",
                        AdditionalNotes = "Preparing for CSM exam."
                    },
                    new Booking
                    {
                        UserId          = user3.UserId,
                        WorkshopEventId = event5.WorkshopEventId,
                        BookingStatus   = "Confirmed",
                        BookingDate     = new DateTime(2026, 3, 6),
                        Gender          = "Female",
                        Age             = 32,
                        Occupation      = "DevOps Engineer",
                        City            = "Pune",
                        Proof           = "Driving License",
                        AdditionalNotes = "Looking forward to Lambda labs."
                    }
                };

                context.Bookings.AddRange(bookings);
                await context.SaveChangesAsync();
            }

            // ── Feedbacks ─────────────────────────────────────────────────────
            if (!await context.Feedbacks.AnyAsync())
            {
                var user1   = await context.Users.FirstAsync(u => u.Email == "priya@example.com");
                var user2   = await context.Users.FirstAsync(u => u.Email == "arjun@example.com");
                var user3   = await context.Users.FirstAsync(u => u.Email == "meena@example.com");

                var booking1 = await context.Bookings.FirstAsync(b => b.UserId == user1.UserId);
                var booking3 = await context.Bookings.FirstAsync(b => b.UserId == user2.UserId);
                var booking5 = await context.Bookings.FirstAsync(b => b.UserId == user3.UserId);

                var feedbacks = new List<Feedback>
                {
                    new Feedback
                    {
                        UserId        = user1.UserId,
                        BookingId     = booking1.BookingId,
                        FeedbackText  = "The Full-Stack Bootcamp was incredibly well-structured. The Angular and .NET Core sessions were very practical. Would definitely recommend it!",
                        Date          = new DateTime(2026, 3, 6, 10, 0, 0),
                        AdminResponse = "Thank you for your kind words, Priya! We're glad you found it practical. See you at the next event!",
                        ResponseDate  = new DateTime(2026, 3, 6, 14, 0, 0)
                    },
                    new Feedback
                    {
                        UserId        = user2.UserId,
                        BookingId     = booking3.BookingId,
                        FeedbackText  = "Data Science session was great but I felt the ML section was a bit rushed. More time on model evaluation would help.",
                        Date          = new DateTime(2026, 3, 6, 11, 0, 0),
                        AdminResponse = null,
                        ResponseDate  = null
                    },
                    new Feedback
                    {
                        UserId        = user3.UserId,
                        BookingId     = booking5.BookingId,
                        FeedbackText  = "AWS Cloud Architecture workshop was excellent! The hands-on labs on Lambda and CloudFormation were the highlight. Great instructors.",
                        Date          = new DateTime(2026, 3, 6, 12, 0, 0),
                        AdminResponse = "We appreciate your feedback, Meena! Happy to hear the labs were helpful. Stay tuned for the Advanced AWS workshop.",
                        ResponseDate  = new DateTime(2026, 3, 6, 15, 30, 0)
                    }
                };

                context.Feedbacks.AddRange(feedbacks);
                await context.SaveChangesAsync();
            }
        }
    }
}
