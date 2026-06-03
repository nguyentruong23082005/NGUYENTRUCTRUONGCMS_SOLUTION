using System.Threading.Tasks;
using CMS.Data.Entities;

namespace CMS.Backend.Services.Api
{
    public interface IStockLockStrategy
    {
        Task<Product?> LockProductAsync(int id);
        Task<OptionValue?> LockOptionValueAsync(int id);
    }
}
