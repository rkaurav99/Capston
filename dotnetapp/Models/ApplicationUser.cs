using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace dotnetapp.Models
{
    public class ApplicationUser : IdentityUser
    {
        [MaxLength(50)]
        public string Name { get; set; }
    }
}
