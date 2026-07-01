using CMS.Data.Entities;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace CMS.Backend.Helpers
{
    public static class JwtTokenHelper
    {
        public static string GenerateToken(Customer customer, IConfiguration configuration)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtKey = configuration["Jwt:Key"];
            if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey.Length < 32)
            {
                throw new InvalidOperationException("Jwt:Key must be configured outside source control and contain at least 32 characters.");
            }

            var key = Encoding.UTF8.GetBytes(jwtKey);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, customer.Id.ToString()),
                new Claim(ClaimTypes.Email, customer.Email),
                new Claim(ClaimTypes.Name, customer.FullName),
                new Claim("token_version", customer.TokenVersion.ToString())
            };

            var expiryMinutes = double.TryParse(configuration["Jwt:ExpiryMinutes"], out var minutes) ? minutes : 1440;

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(expiryMinutes),
                Issuer = configuration["Jwt:Issuer"],
                Audience = configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
