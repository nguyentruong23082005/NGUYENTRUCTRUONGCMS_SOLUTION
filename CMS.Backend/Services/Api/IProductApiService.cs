using System.Threading.Tasks;
using CMS.Backend.Models.Api;
using CMS.Backend.Models.Dtos;

namespace CMS.Backend.Services.Api
{
    public interface IProductApiService
    {
        Task<PagedResult<ProductDto>> GetPagedAsync(ProductQuery query);
        Task<ProductDto?> GetByIdAsync(int id);
        Task<ProductDto?> GetBySlugAsync(string slug);
    }
}
