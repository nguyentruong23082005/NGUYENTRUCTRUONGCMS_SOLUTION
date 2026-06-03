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
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [Route("api/orders")]
    public sealed class OrdersController : ControllerBase
    {
        private readonly IOrderApiService _orderService;

        public OrdersController(IOrderApiService orderService)
        {
            _orderService = orderService;
        }

        /// <summary>
        /// Đặt đơn hàng mới.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderDto dto)
        {
            var customerIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerIdStr) || !int.TryParse(customerIdStr, out int customerId))
            {
                return Unauthorized(ApiResponse.FailureResponse("Không tìm thấy thông tin xác thực."));
            }

            try
            {
                var result = await _orderService.PlaceOrderAsync(customerId, dto);
                return Ok(ApiResponse.SuccessResponse(result, "Đặt hàng thành công."));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse.FailureResponse(ex.Message));
            }
        }

        /// <summary>
        /// Xem lịch sử đơn hàng của khách hàng (phân trang).
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetOrderHistory([FromQuery] OrderHistoryQuery query)
        {
            var customerIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerIdStr) || !int.TryParse(customerIdStr, out int customerId))
            {
                return Unauthorized(ApiResponse.FailureResponse("Không tìm thấy thông tin xác thực."));
            }

            var result = await _orderService.GetOrderHistoryAsync(customerId, query ?? new OrderHistoryQuery());
            return Ok(ApiResponse.SuccessResponse(result));
        }

        /// <summary>
        /// Xem chi tiết một đơn hàng.
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetOrderDetails(int id)
        {
            var customerIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerIdStr) || !int.TryParse(customerIdStr, out int customerId))
            {
                return Unauthorized(ApiResponse.FailureResponse("Không tìm thấy thông tin xác thực."));
            }

            var result = await _orderService.GetOrderDetailsAsync(customerId, id);
            if (result == null)
            {
                return NotFound(ApiResponse.FailureResponse("Đơn hàng không tồn tại hoặc không thuộc quyền sở hữu của bạn."));
            }

            return Ok(ApiResponse.SuccessResponse(result));
        }

        /// <summary>
        /// Yêu cầu hủy đơn hàng.
        /// </summary>
        [HttpPost("{id:int}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            var customerIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerIdStr) || !int.TryParse(customerIdStr, out int customerId))
            {
                return Unauthorized(ApiResponse.FailureResponse("Không tìm thấy thông tin xác thực."));
            }

            try
            {
                var success = await _orderService.CancelOrderAsync(customerId, id);
                if (success)
                {
                    return Ok(ApiResponse.SuccessResponse(null, "Hủy đơn hàng thành công."));
                }
                return BadRequest(ApiResponse.FailureResponse("Không thể hủy đơn hàng."));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse.FailureResponse(ex.Message));
            }
        }
    }
}
