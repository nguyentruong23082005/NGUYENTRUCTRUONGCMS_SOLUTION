using System.Threading.Tasks;
using CMS.Backend.Models.Api;
using CMS.Backend.Services.Api;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Backend.Controllers.Api
{
    [ApiController]
    [Route("api/stores")]
    public sealed class StoresController : ControllerBase
    {
        private readonly IStoreApiService _storeService;

        public StoresController(IStoreApiService storeService)
        {
            _storeService = storeService;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách cửa hàng (Store Locator).
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse))]
        public async Task<IActionResult> GetAll()
        {
            var stores = await _storeService.GetAllStoresAsync();
            return Ok(ApiResponse.SuccessResponse(stores));
        }
    }
}
