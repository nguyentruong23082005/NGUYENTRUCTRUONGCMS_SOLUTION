using CMS.Backend.Helpers;
using CMS.Backend.Models.Dtos;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FirebaseAdmin;
using FirebaseAdmin.Auth;

namespace CMS.Backend.Services.Api
{
    public sealed class CustomerApiService : ICustomerApiService
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _config;
        private readonly IMemoryCache _cache;
        private readonly IEmailService _emailService;
        private readonly ILogger<CustomerApiService> _logger;

        public CustomerApiService(ApplicationDbContext db, IConfiguration config, IMemoryCache cache,
            IEmailService emailService, ILogger<CustomerApiService> logger)
        {
            _db = db;
            _config = config;
            _cache = cache;
            _emailService = emailService;
            _logger = logger;
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

            // Gửi email chúc mừng đăng ký thành công.
            // EmailService tự bắt/log lỗi nên không làm hỏng luồng đăng ký nếu SMTP lỗi.
            await _emailService.SendWelcomeEmailAsync(customer.Email, customer.FullName);


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

        public async Task<LoginResponseDto?> LoginWithSocialAsync(SocialLoginDto dto)
        {
            if (FirebaseApp.DefaultInstance == null)
            {
                throw new InvalidOperationException("FirebaseApp is not initialized. Firebase credentials may be missing.");
            }

            FirebaseToken decodedToken;
            try
            {
                decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(dto.IdToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi xác thực Firebase ID Token.");
                return null;
            }

            var uid = decodedToken.Uid;
            var email = decodedToken.Claims.TryGetValue("email", out var emailObj) ? emailObj?.ToString() : null;
            var name = (decodedToken.Claims.TryGetValue("name", out var nameObj) ? nameObj?.ToString() : null) ?? "Social User";
            
            // Lấy email_verified từ claims
            bool emailVerified = false;
            if (decodedToken.Claims.TryGetValue("email_verified", out var evObj))
            {
                if (evObj is bool ev)
                {
                    emailVerified = ev;
                }
                else if (evObj?.ToString()?.ToLower() == "true")
                {
                    emailVerified = true;
                }
            }

            // Lấy provider từ firebase sign_in_provider claim
            string provider = "Social";
            if (decodedToken.Claims.TryGetValue("firebase", out var firebaseObj))
            {
                if (firebaseObj is IDictionary<string, object> firebaseDict)
                {
                    if (firebaseDict.TryGetValue("sign_in_provider", out var pObj))
                    {
                        provider = pObj?.ToString() ?? "Social";
                    }
                }
                else
                {
                    var str = firebaseObj.ToString();
                    if (str?.Contains("google.com") == true) provider = "google.com";
                    else if (str?.Contains("facebook.com") == true) provider = "facebook.com";
                }
            }

            if (string.IsNullOrEmpty(email))
            {
                // Fallback email nếu không có
                email = $"{uid}@firebase.com";
            }

            var emailLower = email.Trim().ToLower();

            // 1. Tìm theo FirebaseUid
            var customer = await _db.Customers.FirstOrDefaultAsync(c => c.FirebaseUid == uid);
            if (customer == null || customer.IsDeleted)
            {
                // 2. Tìm theo Email để liên kết tài khoản local có sẵn
                customer = await _db.Customers.FirstOrDefaultAsync(c => c.Email.ToLower() == emailLower);
                if (customer != null && !customer.IsDeleted)
                {
                    // Chỉ auto-link nếu email đã được xác thực (EmailVerified == true)
                    if (!emailVerified)
                    {
                        throw new InvalidOperationException("Email của tài khoản này chưa được xác minh trên Firebase. Không thể tự động liên kết.");
                    }

                    customer.FirebaseUid = uid;
                    customer.SignInProvider = provider;
                    await _db.SaveChangesAsync();
                }
                else
                {
                    // 3. Đăng ký tài khoản mới nếu chưa tồn tại
                    customer = new Customer
                    {
                        FullName = name.Trim(),
                        Email = email,
                        FirebaseUid = uid,
                        SignInProvider = provider,
                        TokenVersion = 1,
                        Password = null // Tài khoản đăng nhập mạng xã hội không có mật khẩu local
                    };

                    _db.Customers.Add(customer);
                    await _db.SaveChangesAsync();

                    // Gửi email chào mừng đăng ký thành công
                    await _emailService.SendWelcomeEmailAsync(customer!.Email, customer!.FullName);
                }
            }

            // Sinh JWT Token cho khách hàng
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

        public async Task ForgotPasswordAsync(string email)
        {
            var customer = await _db.Customers
                .FirstOrDefaultAsync(c => c.Email.ToLower() == email.Trim().ToLower());
            if (customer == null) return; // Không leak thông tin user có tồn tại hay không

            customer.ResetPasswordToken = Guid.NewGuid().ToString("N");
            customer.ResetPasswordExpiry = DateTime.UtcNow.AddHours(1);
            await _db.SaveChangesAsync();

            var frontendBaseUrl = (_config["Frontend:BaseUrl"] ?? "http://localhost:5173").TrimEnd('/');
            var resetLink = $"{frontendBaseUrl}/reset-password?token={Uri.EscapeDataString(customer.ResetPasswordToken)}";
            _ = _emailService.SendResetPasswordEmailAsync(customer.Email, customer.FullName, resetLink)
                .ContinueWith(t => _logger.LogError(t.Exception,
                    "Lỗi gửi email reset password cho {Email}", customer.Email),
                    TaskContinuationOptions.OnlyOnFaulted);
        }

        public async Task ResetPasswordAsync(string token, string newPassword)
        {
            var customer = await _db.Customers
                .FirstOrDefaultAsync(c => c.ResetPasswordToken == token
                    && c.ResetPasswordExpiry > DateTime.UtcNow);
            if (customer == null)
                throw new InvalidOperationException("Token không hợp lệ hoặc đã hết hạn.");

            customer.Password = PasswordHasher.Hash(customer, newPassword);
            customer.ResetPasswordToken = null;
            customer.ResetPasswordExpiry = null;
            customer.TokenVersion++;
            InvalidateTokenCache(customer.Id);
            await _db.SaveChangesAsync();
        }
    }
}
