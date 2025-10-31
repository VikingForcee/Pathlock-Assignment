using System.ComponentModel.DataAnnotations;

namespace MiniPm.Api.DTOs
{
    public class RegisterDto
    {
        [Required, EmailAddress] public string Email { get; set; } = null!;
        [Required, MinLength(6)] public string Password { get; set; } = null!;
    }

    public class LoginDto
    {
        [Required, EmailAddress] public string Email { get; set; } = null!;
        [Required] public string Password { get; set; } = null!;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
    }
}
