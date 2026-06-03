using System.Collections.Generic;
using System.Threading.Tasks;
using CMS.Backend.Models.Dtos;

namespace CMS.Backend.Services.Api
{
    public interface IStoreApiService
    {
        Task<IReadOnlyCollection<StoreDto>> GetAllStoresAsync();
    }
}
