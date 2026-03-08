using System.Text;
using dotnetapp.Data;
using dotnetapp.Models;
using dotnetapp.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://0.0.0.0:8080");

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = null; // Preserve PascalCase property names
    });

// EF Core
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// Authentication - JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JWT:ValidAudience"],
        ValidIssuer = builder.Configuration["JWT:ValidIssuer"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Secret"]))
    };
});

// Register services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<ReminderService>();
builder.Services.AddScoped<WorkshopEventService>();
builder.Services.AddScoped<BookingService>();
builder.Services.AddScoped<FeedbackService>();
builder.Services.AddScoped<WaitlistService>();
builder.Services.AddScoped<WorkshopRatingService>();
builder.Services.AddScoped<FavoriteWorkshopService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer {token}'",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Patch legacy databases in place. Some environments have existing tables but no
// EF migration history, so full Migrate() can fail with "object already exists".
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("StartupSchema");

    try
    {
        dbContext.Database.ExecuteSqlRaw(
            """
            IF COL_LENGTH('Bookings', 'Is24HourReminderSent') IS NULL
            BEGIN
                ALTER TABLE [Bookings]
                ADD [Is24HourReminderSent] bit NOT NULL
                    CONSTRAINT [DF_Bookings_Is24HourReminderSent] DEFAULT(0);
            END;

            IF COL_LENGTH('Bookings', 'Is6HourReminderSent') IS NULL
            BEGIN
                ALTER TABLE [Bookings]
                ADD [Is6HourReminderSent] bit NOT NULL
                    CONSTRAINT [DF_Bookings_Is6HourReminderSent] DEFAULT(0);
            END;

            IF COL_LENGTH('Feedbacks', 'Rating') IS NULL
            BEGIN
                ALTER TABLE [Feedbacks]
                ADD [Rating] int NULL;
            END;

            IF OBJECT_ID(N'[Notifications]', N'U') IS NULL
            BEGIN
                CREATE TABLE [Notifications] (
                    [NotificationId] int IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    [UserId] int NOT NULL,
                    [Title] nvarchar(max) NOT NULL,
                    [Message] nvarchar(max) NOT NULL,
                    [Type] nvarchar(max) NOT NULL,
                    [IsRead] bit NOT NULL,
                    [CreatedAt] datetime2 NOT NULL,
                    [RelatedEntityId] int NULL,
                    CONSTRAINT [FK_Notifications_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users]([UserId]) ON DELETE CASCADE
                );
                CREATE INDEX [IX_Notifications_UserId] ON [Notifications]([UserId]);
            END;

            IF OBJECT_ID(N'[WaitlistEntries]', N'U') IS NULL
            BEGIN
                CREATE TABLE [WaitlistEntries] (
                    [WaitlistId] int IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    [UserId] int NOT NULL,
                    [WorkshopEventId] int NOT NULL,
                    [JoinedAt] datetime2 NOT NULL,
                    [Status] nvarchar(max) NOT NULL,
                    CONSTRAINT [FK_WaitlistEntries_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users]([UserId]) ON DELETE CASCADE,
                    CONSTRAINT [FK_WaitlistEntries_WorkshopEvents_WorkshopEventId] FOREIGN KEY ([WorkshopEventId]) REFERENCES [WorkshopEvents]([WorkshopEventId]) ON DELETE CASCADE
                );
                CREATE INDEX [IX_WaitlistEntries_UserId] ON [WaitlistEntries]([UserId]);
                CREATE INDEX [IX_WaitlistEntries_WorkshopEventId] ON [WaitlistEntries]([WorkshopEventId]);
            END;

            IF OBJECT_ID(N'[WorkshopRatings]', N'U') IS NULL
            BEGIN
                CREATE TABLE [WorkshopRatings] (
                    [RatingId] int IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    [UserId] int NOT NULL,
                    [WorkshopEventId] int NOT NULL,
                    [RatingValue] int NOT NULL,
                    [ReviewText] nvarchar(max) NULL,
                    [CreatedAt] datetime2 NOT NULL,
                    CONSTRAINT [FK_WorkshopRatings_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users]([UserId]) ON DELETE CASCADE,
                    CONSTRAINT [FK_WorkshopRatings_WorkshopEvents_WorkshopEventId] FOREIGN KEY ([WorkshopEventId]) REFERENCES [WorkshopEvents]([WorkshopEventId]) ON DELETE CASCADE
                );
                CREATE INDEX [IX_WorkshopRatings_UserId] ON [WorkshopRatings]([UserId]);
                CREATE INDEX [IX_WorkshopRatings_WorkshopEventId] ON [WorkshopRatings]([WorkshopEventId]);
            END;

            IF OBJECT_ID(N'[FavoriteWorkshops]', N'U') IS NULL
            BEGIN
                CREATE TABLE [FavoriteWorkshops] (
                    [FavoriteId] int IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    [UserId] int NOT NULL,
                    [WorkshopEventId] int NOT NULL,
                    [CreatedAt] datetime2 NOT NULL,
                    CONSTRAINT [FK_FavoriteWorkshops_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users]([UserId]) ON DELETE CASCADE,
                    CONSTRAINT [FK_FavoriteWorkshops_WorkshopEvents_WorkshopEventId] FOREIGN KEY ([WorkshopEventId]) REFERENCES [WorkshopEvents]([WorkshopEventId]) ON DELETE CASCADE
                );
                CREATE INDEX [IX_FavoriteWorkshops_UserId] ON [FavoriteWorkshops]([UserId]);
                CREATE INDEX [IX_FavoriteWorkshops_WorkshopEventId] ON [FavoriteWorkshops]([WorkshopEventId]);
            END;
            """);
    }
    catch (Exception ex)
    {
        logger.LogWarning(ex, "Schema patch step failed. Continuing startup with existing schema.");
    }
}

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Workshop Event Management API v1");
    c.RoutePrefix = string.Empty;
});

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
