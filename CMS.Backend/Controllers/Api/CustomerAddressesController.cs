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
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ApiController]
    [Route("api/customers/addresses")]
    public sealed class CustomerAddressesController : ControllerBase
    {
        private readonly ICustomerAddressApiService _addressService;

        public CustomerAddressesController(ICustomerAddressApiService addressService)
        {
            _addressService = addressService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAddresses()
        {
            var customerIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerIdStr) || !int.TryParse(customerIdStr, out int customerId))
            {
                return Unauthorized(ApiResponse.FailureResponse("Không tìm thấy thông tin xác thực."));
            }

            var result = await _addressService.GetAddressesAsync(customerId);
            return Ok(ApiResponse.SuccessResponse(result));
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetAddressById(int id)
        {
            var customerIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerIdStr) || !int.TryParse(customerIdStr, out int customerId))
            {
                return Unauthorized(ApiResponse.FailureResponse("Không tìm thấy thông tin xác thực."));
            }

            var result = await _addressService.GetAddressByIdAsync(customerId, id);
            if (result == null)
            {
                return NotFound(ApiResponse.FailureResponse("Không tìm thấy địa chỉ này."));
            }

            return Ok(ApiResponse.SuccessResponse(result));
        }

        [HttpPost]
        public async Task<IActionResult> CreateAddress([FromBody] CreateAddressDto dto)
        {
            var customerIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerIdStr) || !int.TryParse(customerIdStr, out int customerId))
            {
                return Unauthorized(ApiResponse.FailureResponse("Không tìm thấy thông tin xác thực."));
            }

            var result = await _addressService.CreateAddressAsync(customerId, dto);
            return Ok(ApiResponse.SuccessResponse(result, "Thêm địa chỉ thành công."));
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateAddress(int id, [FromBody] CreateAddressDto dto)
        {
            var customerIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerIdStr) || !int.TryParse(customerIdStr, out int customerId))
            {
                return Unauthorized(ApiResponse.FailureResponse("Không tìm thấy thông tin xác thực."));
            }

            var result = await _addressService.UpdateAddressAsync(customerId, id, dto);
            if (result == null)
            {
                return NotFound(ApiResponse.FailureResponse("Không tìm thấy địa chỉ để cập nhật."));
            }

            return Ok(ApiResponse.SuccessResponse(result, "Cập nhật địa chỉ thành công."));
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteAddress(int id)
        {
            var customerIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerIdStr) || !int.TryParse(customerIdStr, out int customerId))
            {
                return Unauthorized(ApiResponse.FailureResponse("Không tìm thấy thông tin xác thực."));
            }

            var success = await _addressService.DeleteAddressAsync(customerId, id);
            if (!success)
            {
                return NotFound(ApiResponse.FailureResponse("Không tìm thấy địa chỉ để xóa."));
            }

            return Ok(ApiResponse.SuccessResponse(null, "Xóa địa chỉ thành công."));
        }

        [HttpPost("{id:int}/set-default")]
        public async Task<IActionResult> SetDefaultAddress(int id)
        {
            var customerIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerIdStr) || !int.TryParse(customerIdStr, out int customerId))
            {
                return Unauthorized(ApiResponse.FailureResponse("Không tìm thấy thông tin xác thực."));
            }

            var success = await _addressService.SetDefaultAddressAsync(customerId, id);
            if (!success)
            {
                return NotFound(ApiResponse.FailureResponse("Không tìm thấy địa chỉ để thiết lập mặc định."));
            }

            return Ok(ApiResponse.SuccessResponse(null, "Thiết lập địa chỉ mặc định thành công."));
        }
    }
}
