using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using dotnetapp.Data;
using dotnetapp.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace dotnetapp.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> userManager;
        private readonly RoleManager<IdentityRole> roleManager;
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;

        public AuthService(UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager, IConfiguration configuration,
            ApplicationDbContext context)
        {
            this.userManager = userManager;
            this.roleManager = roleManager;
            _configuration = configuration;
            _context = context;
        }

        public async Task<(int, string)> Registration(User model, string role)
        {
            var userExists = await userManager.FindByEmailAsync(model.Email);
            if (userExists != null)
                return (0, "User already exists");

            ApplicationUser user = new ApplicationUser
            {
                Email = model.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.Email,
                Name = model.Username
            };

            var createUserResult = await userManager.CreateAsync(user, model.Password);
            if (!createUserResult.Succeeded)
            {
                var errors = string.Join(", ", createUserResult.Errors.Select(e => e.Description));
                return (0, $"User creation failed: {errors}");
            }

            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));

            await userManager.AddToRoleAsync(user, role);

            // Save user details to the Users table as well
            var newUser = new User
            {
                Email = model.Email,
                Password = model.Password,
                Username = model.Username,
                MobileNumber = model.MobileNumber,
                UserRole = role,
                SecretKey = model.SecretKey
            };
            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return (1, "User created successfully!");
        }

        public async Task<(int, string)> Login(LoginModel model)
        {
            var user = await userManager.FindByEmailAsync(model.Email);
            if (user == null)
                return (0, "Invalid email");

            if (!await userManager.CheckPasswordAsync(user, model.Password))
                return (0, "Invalid password");

            var userRoles = await userManager.GetRolesAsync(user);

            var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            foreach (var userRole in userRoles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, userRole));
            }

            // Get UserId from Users table
            var dbUser = _context.Users.FirstOrDefault(u => u.Email == model.Email);
            if (dbUser != null)
            {
                authClaims.Add(new Claim("UserId", dbUser.UserId.ToString()));
            }

            string token = GenerateToken(authClaims);
            return (1, token);
        }

        private string GenerateToken(IEnumerable<Claim> claims)
        {
            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Issuer = _configuration["JWT:ValidIssuer"],
                Audience = _configuration["JWT:ValidAudience"],
                Expires = DateTime.UtcNow.AddHours(3),
                SigningCredentials = new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256),
                Subject = new ClaimsIdentity(claims)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
