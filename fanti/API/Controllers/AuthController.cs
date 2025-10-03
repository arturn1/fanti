using System.Net;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using API.Controllers.Contract;
using Application.Dictionary;
using Domain.Commands;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public class AuthController : BaseController
    {
        private readonly IConfiguration _configuration;

        public AuthController(IConfiguration configuration, DefaultDictionary defaultDictionary) : base(defaultDictionary)
        {
            _configuration = configuration;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            // Simulação de login - em produção isso seria validado via OIDC
            if (ValidateUser(request.Email, request.Password))
            {
                var token = GenerateJwtToken(request.Email);
                var user = GetUserByEmail(request.Email);

                return Ok(new CommandResult(new LoginResponse
                {
                    AccessToken = token,
                    TokenType = "Bearer",
                    ExpiresIn = 3600,
                    User = user
                }, HttpStatusCode.OK));
            }

            return Unauthorized(new CommandResult("Invalid credentials", HttpStatusCode.Unauthorized));
        }

        [HttpPost("refresh")]
        public IActionResult RefreshToken([FromBody] RefreshTokenRequest request)
        {
            // Simulação de refresh token - em produção seria validado
            if (!string.IsNullOrEmpty(request.RefreshToken))
            {
                var token = GenerateJwtToken("admin@fanti.com");

                return Ok(new CommandResult(new LoginResponse
                {
                    AccessToken = token,
                    TokenType = "Bearer",
                    ExpiresIn = 3600
                }, HttpStatusCode.OK));
            }

            return Unauthorized(new CommandResult("Invalid refresh token", HttpStatusCode.Unauthorized));
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // Em produção, invalidaria o token no provedor OIDC
            return Ok(new CommandResult("Logged out successfully", HttpStatusCode.OK));
        }

        private bool ValidateUser(string email, string password)
        {
            // Simulação - em produção seria validado via OIDC provider
            var validUsers = new Dictionary<string, string>
            {
                { "admin@fanti.com", "admin123" },
                { "dev@fanti.com", "dev123" },
                { "manager@fanti.com", "manager123" }
            };

            return validUsers.ContainsKey(email) && validUsers[email] == password;
        }

        private object? GetUserByEmail(string email)
        {
            // Simulação de dados do usuário - em produção viria do OIDC provider
            var users = new Dictionary<string, object>
            {
                { "admin@fanti.com", new {
                    Id = Guid.NewGuid().ToString(),
                    Email = "admin@fanti.com",
                    Name = "Administrador",
                    FirstName = "Admin",
                    LastName = "Sistema",
                    Avatar = "",
                    Role = "1", // Admin
                    IsActive = true
                }},
                { "dev@fanti.com", new {
                    Id = Guid.NewGuid().ToString(),
                    Email = "dev@fanti.com",
                    Name = "Desenvolvedor",
                    FirstName = "Dev",
                    LastName = "Team",
                    Avatar = "",
                    Role = "4", // Developer
                    IsActive = true
                }},
                { "manager@fanti.com", new {
                    Id = Guid.NewGuid().ToString(),
                    Email = "manager@fanti.com",
                    Name = "Gerente",
                    FirstName = "Project",
                    LastName = "Manager",
                    Avatar = "",
                    Role = "2", // ProductOwner
                    IsActive = true
                }}
            };

            return users.ContainsKey(email) ? users[email] : null;
        }

        private string GenerateJwtToken(string email)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("your-secret-key-here-must-be-at-least-256-bits"));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
                new Claim("iss", "fanti-api"),
                new Claim("aud", "fanti-web")
            };

            var token = new JwtSecurityToken(
                issuer: "fanti-api",
                audience: "fanti-web",
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }

    public class LoginResponse
    {
        public required string AccessToken { get; set; }
        public required string TokenType { get; set; }
        public int ExpiresIn { get; set; }
        public object? User { get; set; }
    }

    public class RefreshTokenRequest
    {
        public required string RefreshToken { get; set; }
    }
}
