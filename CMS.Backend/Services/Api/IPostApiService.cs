using System.Threading.Tasks;
using CMS.Backend.Models.Api;
using CMS.Backend.Models.Dtos;

namespace CMS.Backend.Services.Api
{
    public interface IPostApiService
    {
        Task<PagedResult<PostDto>> GetPagedAsync(PostQuery query);
        Task<PostDetailDto?> GetByIdAsync(int id);
        Task<PostDetailDto?> GetBySlugAsync(string slug);
    }
}
