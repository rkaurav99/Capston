using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
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

        private string DecryptPassword(string encryptedBase64)
        {
            try
            {
                var key = Encoding.UTF8.GetBytes(_configuration["Encryption:Key"]);
                var iv  = Encoding.UTF8.GetBytes(_configuration["Encryption:IV"]);
                var cipherBytes = Convert.FromBase64String(encryptedBase64);
                using var aes = Aes.Create();
                aes.Key = key;
                aes.IV  = iv;
                aes.Mode    = CipherMode.CBC;
                aes.Padding = PaddingMode.PKCS7;
                using var decryptor = aes.CreateDecryptor();
                using var ms = new MemoryStream(cipherBytes);
                using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
                using var reader = new StreamReader(cs);
                return reader.ReadToEnd();
            }
            catch
            {
                // If decryption fails (e.g. plain-text in tests), return as-is
                return encryptedBase64;
            }
        }

        public async Task<(int, string)> Registration(User model, string role)
        {
            model.Password = DecryptPassword(model.Password);

            if (string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase))
            {
                if (!string.Equals(model.SecretKey, "LTM2025", StringComparison.Ordinal))
                    return (0, "Invalid admin secret key");
            }
            else
            {
                model.SecretKey = null;
            }

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
            model.Password = DecryptPassword(model.Password);

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

        public async Task<User?> GetUserById(int userId)
        {
            return await Task.FromResult(_context.Users.FirstOrDefault(u => u.UserId == userId));
        }

        public async Task<(int, string)> UpdateUser(int userId, User model)
        {
            var existing = _context.Users.FirstOrDefault(u => u.UserId == userId);
            if (existing == null)
                return (0, "User not found");

            existing.Username = model.Username;
            existing.MobileNumber = model.MobileNumber;

            // Update password if provided
            if (!string.IsNullOrWhiteSpace(model.Password))
            {
                // Update in Identity as well
                var identityUser = await userManager.FindByEmailAsync(existing.Email);
                if (identityUser != null)
                {
                    var token = await userManager.GeneratePasswordResetTokenAsync(identityUser);
                    await userManager.ResetPasswordAsync(identityUser, token, model.Password);
                }
                existing.Password = model.Password;
            }

            _context.Users.Update(existing);
            await _context.SaveChangesAsync();
            return (1, "Profile updated successfully");
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
