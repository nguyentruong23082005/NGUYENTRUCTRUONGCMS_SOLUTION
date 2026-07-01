using System.Threading.Tasks;
using CMS.Backend.Models.Api;
using CMS.Backend.Services.Api;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Backend.Controllers.Api
{
    [ApiController]
    [Route("api/post-categories")]
    public sealed class PostCategoriesController : ControllerBase
    {
        private readonly ICategoryApiService _categoryService;

        public PostCategoriesController(ICategoryApiService categoryService)
        {
            _categoryService = categoryService;
        }

        /// <summary>
        /// Lấy toàn bộ danh mục bài viết.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse))]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _categoryService.GetPostCategoriesAsync();
            return Ok(ApiResponse.SuccessResponse(categories));
        }

        /// <summary>
        /// Lấy cây danh mục bài viết phân cấp cha-con.
        /// </summary>
        [HttpGet("tree")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse))]
        public async Task<IActionResult> GetTree()
        {
            var categoriesTree = await _categoryService.GetPostCategoriesTreeAsync();
            return Ok(ApiResponse.SuccessResponse(categoriesTree));
        }
    }
}
