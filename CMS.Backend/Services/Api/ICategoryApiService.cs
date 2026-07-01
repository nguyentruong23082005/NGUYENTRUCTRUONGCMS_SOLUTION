using System.Collections.Generic;
using System.Threading.Tasks;
using CMS.Backend.Models.Dtos;

namespace CMS.Backend.Services.Api
{
    public interface ICategoryApiService
    {
        Task<IReadOnlyCollection<ProductCategoryDto>> GetProductCategoriesAsync();
        Task<IReadOnlyCollection<PostCategoryDto>> GetPostCategoriesAsync();
        Task<IReadOnlyCollection<ProductCategoryDto>> GetProductCategoriesTreeAsync();
        Task<IReadOnlyCollection<PostCategoryDto>> GetPostCategoriesTreeAsync();
    }
}
