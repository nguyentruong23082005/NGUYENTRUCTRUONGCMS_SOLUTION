using System.Threading.Tasks;
using CMS.Backend.Models.Api;
using CMS.Backend.Services.Api;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Backend.Controllers.Api
{
    [ApiController]
    [Route("api/banners")]
    public sealed class BannersController : ControllerBase
    {
        private readonly IBannerApiService _bannerService;

        public BannersController(IBannerApiService bannerService)
        {
            _bannerService = bannerService;
        }

        /// <summary>
        /// Lấy danh sách banner quảng cáo đang hoạt động.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse))]
        public async Task<IActionResult> GetActive()
        {
            var banners = await _bannerService.GetActiveBannersAsync();
            return Ok(ApiResponse.SuccessResponse(banners));
        }
    }
}
