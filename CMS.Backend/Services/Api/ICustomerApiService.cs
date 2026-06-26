using CMS.Backend.Models.Dtos;
using System.Threading.Tasks;

namespace CMS.Backend.Services.Api
{
    public interface ICustomerApiService
    {
        Task<CustomerDto> RegisterAsync(RegisterDto dto);
        Task<LoginResponseDto?> LoginAsync(LoginDto dto);
        Task<CustomerDto?> GetProfileAsync(int customerId);
        Task<CustomerDto> UpdateProfileAsync(int customerId, UpdateProfileDto dto);
        Task LogoutAsync(int customerId);
        void InvalidateTokenCache(int customerId);
        Task ForgotPasswordAsync(string email);
        Task ResetPasswordAsync(string token, string newPassword);
    }
}
