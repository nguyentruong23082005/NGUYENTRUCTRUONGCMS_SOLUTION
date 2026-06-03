using System.Threading.Tasks;
using CMS.Data;
using CMS.Data.Entities;

namespace CMS.Backend.Services.Api
{
    public sealed class InMemoryStockLockStrategy : IStockLockStrategy
    {
        private readonly ApplicationDbContext _db;

        public InMemoryStockLockStrategy(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<Product?> LockProductAsync(int id)
        {
            return await _db.Products.FindAsync(id);
        }

        public async Task<OptionValue?> LockOptionValueAsync(int id)
        {
            return await _db.OptionValues.FindAsync(id);
        }
    }
}
