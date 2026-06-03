using System.Threading.Tasks;
using CMS.Backend.Models.Api;
using CMS.Backend.Services.Api;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Backend.Controllers.Api
{
    [ApiController]
    [Route("api/product-categories")]
    public sealed class ProductCategoriesController : ControllerBase
    {
        private readonly ICategoryApiService _categoryService;

        public ProductCategoriesController(ICategoryApiService categoryService)
        {
            _categoryService = categoryService;
        }

        /// <summary>
        /// Lấy toàn bộ danh mục sản phẩm.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse))]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _categoryService.GetProductCategoriesAsync();
            return Ok(ApiResponse.SuccessResponse(categories));
        }
    }
}
