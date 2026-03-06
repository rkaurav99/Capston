using dotnetapp.Models;

namespace dotnetapp.Services
{
    public interface IAuthService
    {
        Task<(int, string)> Registration(User model, string role);
        Task<(int, string)> Login(LoginModel model);
        Task<User?> GetUserById(int userId);
        Task<(int, string)> UpdateUser(int userId, User model);
    }
}
