using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using CarRental.Api.Models;

namespace CarRental.Api.Services;

public interface ITokenService
{
    string GenerateAccessToken(NguoiDung user, string roleName);
    string GenerateRefreshToken();
}

public class TokenService : ITokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateAccessToken(NguoiDung user, string roleName)
    {
        var key = _config["Jwt:Key"] ?? "car_rental_super_secret_jwt_key_2026_xyz987_must_be_32_bytes_or_more!";
        var issuer = _config["Jwt:Issuer"] ?? "CarRentalApi";
        var audience = _config["Jwt:Audience"] ?? "CarRentalClient";

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.NguoiDungId.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.HoTen),
            new Claim(ClaimTypes.Role, roleName)
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        return Guid.NewGuid().ToString("N");
    }
}
