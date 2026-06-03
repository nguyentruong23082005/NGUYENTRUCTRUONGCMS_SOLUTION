using System.Threading.Tasks;
using CMS.Backend.Models.Api;
using CMS.Backend.Services.Api;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Backend.Controllers.Api
{
    [ApiController]
    [Route("api/posts")]
    public sealed class PostsController : ControllerBase
    {
        private readonly IPostApiService _postService;

        public PostsController(IPostApiService postService)
        {
            _postService = postService;
        }

        /// <summary>
        /// Lấy danh sách bài viết có phân trang, lọc theo danh mục, tìm kiếm và sắp xếp (Không có Content).
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse))]
        public async Task<IActionResult> GetPaged([FromQuery] PostQuery query)
        {
            var pagedResult = await _postService.GetPagedAsync(query);
            return Ok(ApiResponse.SuccessResponse(pagedResult));
        }

        /// <summary>
        /// Lấy chi tiết bài viết theo mã ID (Có đầy đủ Content).
        /// </summary>
        [HttpGet("{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse))]
        public async Task<IActionResult> GetById(int id)
        {
            if (id <= 0)
            {
                return BadRequest(ApiResponse.FailureResponse("Invalid post ID."));
            }

            var post = await _postService.GetByIdAsync(id);
            if (post == null)
            {
                return NotFound(ApiResponse.FailureResponse("Post not found."));
            }

            return Ok(ApiResponse.SuccessResponse(post));
        }

        /// <summary>
        /// Lấy chi tiết bài viết theo Slug thân thiện SEO (Có đầy đủ Content).
        /// </summary>
        [HttpGet("by-slug/{slug}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse))]
        public async Task<IActionResult> GetBySlug(string slug)
        {
            var post = await _postService.GetBySlugAsync(slug);
            if (post == null)
            {
                return NotFound(ApiResponse.FailureResponse("Post not found."));
            }

            return Ok(ApiResponse.SuccessResponse(post));
        }
    }
}
