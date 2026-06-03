using CMS.Backend.Models.Api;
using CMS.Backend.Models.Dtos;
using CMS.Backend.Services.Api;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace CMS.Backend.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    public sealed class CustomersController : ControllerBase
    {
        private readonly ICustomerApiService _customerService;

        public CustomersController(ICustomerApiService customerService)
        {
            _customerService = customerService;
        }

        /// <summary>
        /// Đăng ký tài khoản khách hàng mới.
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            try
            {
                var result = await _customerService.RegisterAsync(dto);
                return Ok(ApiResponse.SuccessResponse(result, "Đăng ký tài khoản thành công."));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse.FailureResponse(ex.Message));
            }
        }

        /// <summary>
        /// Đăng nhập tài khoản khách hàng để nhận JWT token.
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var result = await _customerService.LoginAsync(dto);
            if (result == null)
            {
                return Unauthorized(ApiResponse.FailureResponse("Email hoặc mật khẩu không chính xác."));
            }
            return Ok(ApiResponse.SuccessResponse(result, "Đăng nhập thành công."));
        }

        /// <summary>
        /// Xem thông tin hồ sơ cá nhân của khách hàng.
        /// </summary>
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var customerIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerIdStr) || !int.TryParse(customerIdStr, out int customerId))
            {
                return Unauthorized(ApiResponse.FailureResponse("Không tìm thấy thông tin xác thực."));
            }

            var result = await _customerService.GetProfileAsync(customerId);
            if (result == null)
            {
                return NotFound(ApiResponse.FailureResponse("Không tìm thấy thông tin khách hàng."));
            }

            return Ok(ApiResponse.SuccessResponse(result));
        }

        /// <summary>
        /// Cập nhật thông tin cá nhân hoặc đổi mật khẩu.
        /// </summary>
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var customerIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerIdStr) || !int.TryParse(customerIdStr, out int customerId))
            {
                return Unauthorized(ApiResponse.FailureResponse("Không tìm thấy thông tin xác thực."));
            }

            try
            {
                var result = await _customerService.UpdateProfileAsync(customerId, dto);
                return Ok(ApiResponse.SuccessResponse(result, "Cập nhật hồ sơ thành công."));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse.FailureResponse(ex.Message));
            }
        }

        /// <summary>
        /// Đăng xuất và ngay lập tức thu hồi token JWT.
        /// </summary>
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var customerIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerIdStr) || !int.TryParse(customerIdStr, out int customerId))
            {
                return Unauthorized(ApiResponse.FailureResponse("Không tìm thấy thông tin xác thực."));
            }

            await _customerService.LogoutAsync(customerId);
            return Ok(ApiResponse.SuccessResponse(null, "Đăng xuất thành công và vô hiệu hóa token."));
        }
    }
}
