using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace MiniPm.Api.Auth
{
    public static class JwtHelpers
    {
        public static string CreateToken(Guid userId, string email, IConfiguration config, out DateTime expiresAt)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            expiresAt = DateTime.UtcNow.AddDays(1);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()), // ✅ essential for UserId
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()) // optional but consistent
            };

            var token = new JwtSecurityToken(
                issuer: config["Jwt:Issuer"],
                audience: config["Jwt:Audience"],
                claims: claims,
                expires: expiresAt,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
