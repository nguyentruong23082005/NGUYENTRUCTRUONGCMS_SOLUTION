using CMS.Backend.Models.Api;
using CMS.Backend.Models.Dtos;
using CMS.Backend.Services.Api;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace CMS.Backend.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    public sealed class VouchersController : ControllerBase
    {
        private readonly IVoucherApiService _voucherService;

        public VouchersController(IVoucherApiService voucherService)
        {
            _voucherService = voucherService;
        }

        /// <summary>
        /// Lấy danh sách các mã giảm giá khả dụng (đang hoạt động và chưa hết hạn).
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAvailableVouchers()
        {
            var result = await _voucherService.GetAvailableVouchersAsync();
            return Ok(ApiResponse.SuccessResponse(result));
        }

        /// <summary>
        /// Kiểm tra tính hợp lệ và số tiền giảm giá của voucher dựa trên giá trị đơn hàng.
        /// </summary>
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpGet("validate")]
        public async Task<IActionResult> ValidateVoucher([FromQuery] string code, [FromQuery] decimal orderSubtotal)
        {
            var customerIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerIdStr) || !int.TryParse(customerIdStr, out int customerId))
            {
                return Unauthorized(ApiResponse.FailureResponse("Không tìm thấy thông tin xác thực."));
            }

            var result = await _voucherService.ValidateVoucherAsync(code, customerId, orderSubtotal);
            if (!result.IsValid)
            {
                return BadRequest(ApiResponse.FailureResponse(result.Message, new[] { result.Message }));
            }

            return Ok(ApiResponse.SuccessResponse(result, result.Message));
        }
    }
}
