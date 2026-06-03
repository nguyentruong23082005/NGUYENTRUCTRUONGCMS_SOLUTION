using CMS.Backend.Models.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CMS.Backend.Services.Api
{
    public interface IReviewApiService
    {
        Task<IReadOnlyCollection<ReviewDto>> GetProductReviewsAsync(int productId, int page = 1, int pageSize = 10);
        Task<ReviewDto> CreateReviewAsync(int customerId, CreateReviewDto dto);
    }
}
