using CMS.Backend.Helpers;
using CMS.Backend.Models.Dtos;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace CMS.Backend.Services.Api
{
    public sealed class CustomerApiService : ICustomerApiService
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _config;
        private readonly IMemoryCache _cache;

        public CustomerApiService(ApplicationDbContext db, IConfiguration config, IMemoryCache cache)
        {
            _db = db;
            _config = config;
            _cache = cache;
        }

        public async Task<CustomerDto> RegisterAsync(RegisterDto dto)
        {
            var emailLower = dto.Email.Trim().ToLower();
            if (await _db.Customers.AnyAsync(c => c.Email.ToLower() == emailLower))
            {
                throw new InvalidOperationException("Email này đã được sử dụng.");
            }

            var customer = new Customer
            {
                FullName = dto.FullName.Trim(),
                Email = dto.Email.Trim(),
                Phone = dto.Phone?.Trim(),
                TokenVersion = 1
            };

            customer.Password = PasswordHasher.Hash(customer, dto.Password);

            _db.Customers.Add(customer);
            await _db.SaveChangesAsync();

            return new CustomerDto
            {
                Id = customer.Id,
                FullName = customer.FullName,
                Email = customer.Email,
                Phone = customer.Phone
            };
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginDto dto)
        {
            var emailLower = dto.Email.Trim().ToLower();
            var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Email.ToLower() == emailLower);
            if (customer == null || customer.IsDeleted)
            {
                return null;
            }

            if (!PasswordHasher.Verify(customer, customer.Password ?? string.Empty, dto.Password))
            {
                return null;
            }

            var token = JwtTokenHelper.GenerateToken(customer, _config);

            return new LoginResponseDto
            {
                Token = token,
                Customer = new CustomerDto
                {
                    Id = customer.Id,
                    FullName = customer.FullName,
                    Email = customer.Email,
                    Phone = customer.Phone
                }
            };
        }

        public async Task<CustomerDto?> GetProfileAsync(int customerId)
        {
            var customer = await _db.Customers.FindAsync(customerId);
            if (customer == null || customer.IsDeleted)
            {
                return null;
            }

            return new CustomerDto
            {
                Id = customer.Id,
                FullName = customer.FullName,
                Email = customer.Email,
                Phone = customer.Phone
            };
        }

        public async Task<CustomerDto> UpdateProfileAsync(int customerId, UpdateProfileDto dto)
        {
            var customer = await _db.Customers.FindAsync(customerId);
            if (customer == null || customer.IsDeleted)
            {
                throw new InvalidOperationException("Không tìm thấy khách hàng.");
            }

            customer.FullName = dto.FullName.Trim();
            customer.Phone = dto.Phone?.Trim();

            if (!string.IsNullOrEmpty(dto.NewPassword))
            {
                if (string.IsNullOrEmpty(dto.CurrentPassword))
                {
                    throw new InvalidOperationException("Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu.");
                }

                if (!PasswordHasher.Verify(customer, customer.Password ?? string.Empty, dto.CurrentPassword))
                {
                    throw new InvalidOperationException("Mật khẩu hiện tại không chính xác.");
                }

                customer.Password = PasswordHasher.Hash(customer, dto.NewPassword);
                
                customer.TokenVersion++;
                InvalidateTokenCache(customerId);
            }

            await _db.SaveChangesAsync();

            return new CustomerDto
            {
                Id = customer.Id,
                FullName = customer.FullName,
                Email = customer.Email,
                Phone = customer.Phone
            };
        }

        public async Task LogoutAsync(int customerId)
        {
            var customer = await _db.Customers.FindAsync(customerId);
            if (customer != null && !customer.IsDeleted)
            {
                customer.TokenVersion++;
                await _db.SaveChangesAsync();
            }
            InvalidateTokenCache(customerId);
        }

        public void InvalidateTokenCache(int customerId)
        {
            _cache.Remove($"token-version-{customerId}");
        }
    }
}
