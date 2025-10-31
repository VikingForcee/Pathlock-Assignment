using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniPm.Api.Data;
using MiniPm.Api.DTOs;
using MiniPm.Api.Models;
using MiniPm.Api.Auth;
using BCrypt.Net;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;


[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, IConfiguration config) { _db = db; _config = config; }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email)) return BadRequest("Email already exists");
        var user = new User { Id = Guid.NewGuid(), Email = dto.Email, PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password) };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        var token = JwtHelpers.CreateToken(user.Id, user.Email, _config, out var expires);
        return Ok(new AuthResponseDto { Token = token, ExpiresAt = expires });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _db.Users.SingleOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash)) return Unauthorized("Invalid credentials");
        var token = JwtHelpers.CreateToken(user.Id, user.Email, _config, out var expires);
        return Ok(new AuthResponseDto { Token = token, ExpiresAt = expires });
    }
}
