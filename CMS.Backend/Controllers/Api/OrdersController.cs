using CMS.Backend.Models.Api;
using CMS.Backend.Models.Dtos;
using CMS.Backend.Services.Api;
using CMS.Backend.Services.Payment;
using CMS.Backend.Services.Shipping;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
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
        private readonly IPaymentGatewayFactory _paymentGatewayFactory;

        public OrdersController(
            IOrderApiService orderService,
            IPaymentGatewayFactory paymentGatewayFactory)
        {
            _orderService = orderService;
            _paymentGatewayFactory = paymentGatewayFactory;
        }

        /// <summary>
        /// Đặt đơn hàng mới.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> PlaceOrder(
            [FromBody] PlaceOrderDto dto,
            [FromServices] IEmailService emailService,
            [FromServices] CMS.Data.ApplicationDbContext db)
        {
            var customerIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerIdStr) || !int.TryParse(customerIdStr, out int customerId))
            {
                return Unauthorized(ApiResponse.FailureResponse("Không tìm thấy thông tin xác thực."));
            }

            try
            {
                // Thanh toán online → suppress email, chỉ gửi sau khi payment URL thành công
                bool isOnlinePayment = dto.PaymentMethod != PaymentMethod.COD;
                var result = await _orderService.PlaceOrderAsync(customerId, dto, suppressEmail: isOnlinePayment);

                if (isOnlinePayment)
                {
                    try
                    {
                        var gateway = _paymentGatewayFactory.GetGateway(dto.PaymentMethod);
                        var returnUrl = Url.Action($"{dto.PaymentMethod}Return", "Payment", null, Request.Scheme) ?? string.Empty;
                         result.PaymentUrl = await gateway.CreatePaymentUrlAsync(
                            new Order
                            {
                                Id = result.Id,
                                TotalAmount = result.TotalAmount,
                                PaymentMethod = dto.PaymentMethod
                            },
                            returnUrl,
                            returnUrl);
                    }
                    catch (Exception ex)
                    {
                        // Payment gateway fail → rollback đơn hàng, KHÔNG gửi email
                        await _orderService.RollbackOrderAsync(result.Id);
                        throw new InvalidOperationException($"Không thể tạo liên kết thanh toán: {ex.Message}");
                    }
                }

                return Ok(ApiResponse.SuccessResponse(result, "Đặt hàng thành công."));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse.FailureResponse(ex.Message));
            }
            catch (NotSupportedException ex)
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

        /// <summary>
        /// Lấy danh sách tỉnh/thành từ GHN.
        /// </summary>
        [HttpGet("shipping/provinces")]
        [AllowAnonymous]
        public async Task<IActionResult> GetShippingProvinces([FromServices] IGhnShippingService shippingService)
        {
            var provinces = await shippingService.GetProvincesAsync();
            return Ok(ApiResponse.SuccessResponse(provinces.Select(p => new
            {
                id = p.ProvinceID,
                name = p.ProvinceName
            })));
        }

        /// <summary>
        /// Lấy danh sách quận/huyện từ GHN.
        /// </summary>
        [HttpGet("shipping/districts")]
        [AllowAnonymous]
        public async Task<IActionResult> GetShippingDistricts([FromQuery] int provinceId, [FromServices] IGhnShippingService shippingService)
        {
            if (provinceId <= 0) return BadRequest(ApiResponse.FailureResponse("Tỉnh/Thành không hợp lệ."));
            var districts = await shippingService.GetDistrictsAsync(provinceId);
            return Ok(ApiResponse.SuccessResponse(districts.Select(d => new
            {
                id = d.DistrictID,
                name = d.DistrictName
            })));
        }

        /// <summary>
        /// Lấy danh sách phường/xã từ GHN.
        /// </summary>
        [HttpGet("shipping/wards")]
        [AllowAnonymous]
        public async Task<IActionResult> GetShippingWards([FromQuery] int districtId, [FromServices] IGhnShippingService shippingService)
        {
            if (districtId <= 0) return BadRequest(ApiResponse.FailureResponse("Quận/Huyện không hợp lệ."));
            var wards = await shippingService.GetWardsAsync(districtId);
            return Ok(ApiResponse.SuccessResponse(wards.Select(w => new
            {
                code = w.WardCode,
                name = w.WardName
            })));
        }

        /// <summary>
        /// Tính phí vận chuyển trước khi đặt hàng.
        /// </summary>
        [HttpGet("shipping/fee")]
        [AllowAnonymous]
        public async Task<IActionResult> CalculateShippingFee(
            [FromQuery] int districtId,
            [FromQuery] string wardCode,
            [FromQuery] int? storeId,
            [FromServices] IGhnShippingService shippingService,
            [FromServices] Microsoft.Extensions.Configuration.IConfiguration configuration)
        {
            if (districtId <= 0 || string.IsNullOrWhiteSpace(wardCode))
            {
                return BadRequest(ApiResponse.FailureResponse("Vui lòng chọn đầy đủ Quận/Huyện và Phường/Xã."));
            }
            int defaultWeight = configuration.GetValue<int>("GHN:DefaultWeight", 500);
            var result = await shippingService.CalculateBestFeeAsync(districtId, wardCode.Trim(), defaultWeight, storeId);
            return Ok(ApiResponse.SuccessResponse(new
            {
                fee = result.Fee,
                nearestStoreId = result.NearestStoreId,
                nearestStoreName = result.NearestStoreName,
                isEstimated = result.IsEstimated
            }));
        }
    }
}
