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
    [Route("api/reviews")]
    public sealed class ReviewsController : ControllerBase
    {
        private readonly IReviewApiService _reviewService;

        public ReviewsController(IReviewApiService reviewService)
        {
            _reviewService = reviewService;
        }

        /// <summary>
        /// Lấy danh sách đánh giá của sản phẩm (phân trang).
        /// </summary>
        [HttpGet("/api/products/{productId:int}/reviews")]
        public async Task<IActionResult> GetProductReviews(int productId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _reviewService.GetProductReviewsAsync(productId, page, pageSize);
            return Ok(ApiResponse.SuccessResponse(result));
        }

        /// <summary>
        /// Tạo đánh giá sản phẩm mới.
        /// </summary>
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto dto)
        {
            var customerIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerIdStr) || !int.TryParse(customerIdStr, out int customerId))
            {
                return Unauthorized(ApiResponse.FailureResponse("Không tìm thấy thông tin xác thực."));
            }

            try
            {
                var result = await _reviewService.CreateReviewAsync(customerId, dto);
                return Ok(ApiResponse.SuccessResponse(result, "Đăng đánh giá thành công."));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse.FailureResponse(ex.Message));
            }
        }
    }
}
