using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CMS.Data;
using CMS.Backend.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Services.Api
{
    public sealed class CategoryApiService : ICategoryApiService
    {
        private readonly ApplicationDbContext _db;

        public CategoryApiService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<IReadOnlyCollection<ProductCategoryDto>> GetProductCategoriesAsync()
        {
            var items = await _db.ProductCategories
                .AsNoTracking()
                .OrderBy(c => c.Name)
                .Select(c => new ProductCategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Slug = c.Slug,
                    Description = c.Description
                })
                .ToListAsync();

            return items.AsReadOnly();
        }

        public async Task<IReadOnlyCollection<PostCategoryDto>> GetPostCategoriesAsync()
        {
            var items = await _db.PostCategories
                .AsNoTracking()
                .OrderBy(c => c.Name)
                .Select(c => new PostCategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Slug = c.Slug,
                    Description = c.Description
                })
                .ToListAsync();

            return items.AsReadOnly();
        }
    }
}
