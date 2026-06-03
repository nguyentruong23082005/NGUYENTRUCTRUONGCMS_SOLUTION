using System.Threading.Tasks;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Services.Api
{
    public sealed class SqlServerStockLockStrategy : IStockLockStrategy
    {
        private readonly ApplicationDbContext _db;

        public SqlServerStockLockStrategy(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<Product?> LockProductAsync(int id)
        {
            return await _db.Products
                .FromSqlRaw("SELECT * FROM Products WITH (UPDLOCK) WHERE Id = {0}", id)
                .FirstOrDefaultAsync();
        }

        public async Task<OptionValue?> LockOptionValueAsync(int id)
        {
            return await _db.OptionValues
                .FromSqlRaw("SELECT * FROM OptionValues WITH (UPDLOCK) WHERE Id = {0}", id)
                .FirstOrDefaultAsync();
        }
    }
}
