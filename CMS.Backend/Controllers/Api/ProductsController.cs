using System.Threading.Tasks;
using CMS.Backend.Models.Api;
using CMS.Backend.Services.Api;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Backend.Controllers.Api
{
    [ApiController]
    [Route("api/products")]
    public sealed class ProductsController : ControllerBase
    {
        private readonly IProductApiService _productService;

        public ProductsController(IProductApiService productService)
        {
            _productService = productService;
        }

        /// <summary>
        /// Lấy danh sách sản phẩm có phân trang, lọc theo danh mục, tìm kiếm và sắp xếp.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse))]
        public async Task<IActionResult> GetPaged([FromQuery] ProductQuery query)
        {
            var pagedResult = await _productService.GetPagedAsync(query);
            return Ok(ApiResponse.SuccessResponse(pagedResult));
        }

        /// <summary>
        /// Lấy chi tiết sản phẩm theo mã ID.
        /// </summary>
        [HttpGet("{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse))]
        public async Task<IActionResult> GetById(int id)
        {
            if (id <= 0)
            {
                return BadRequest(ApiResponse.FailureResponse("Invalid product ID."));
            }

            var product = await _productService.GetByIdAsync(id);
            if (product == null)
            {
                return NotFound(ApiResponse.FailureResponse("Product not found."));
            }

            return Ok(ApiResponse.SuccessResponse(product));
        }

        /// <summary>
        /// Lấy chi tiết sản phẩm theo Slug thân thiện SEO.
        /// </summary>
        [HttpGet("by-slug/{slug}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse))]
        public async Task<IActionResult> GetBySlug(string slug)
        {
            var product = await _productService.GetBySlugAsync(slug);
            if (product == null)
            {
                return NotFound(ApiResponse.FailureResponse("Product not found."));
            }

            return Ok(ApiResponse.SuccessResponse(product));
        }
    }
}
