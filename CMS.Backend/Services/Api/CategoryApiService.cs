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
                .Include(c => c.Parent)
                .OrderBy(c => c.Name)
                .Select(c => new ProductCategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Slug = c.Slug,
                    Description = c.Description,
                    ParentId = c.ParentId,
                    ParentName = c.Parent != null ? c.Parent.Name : null,
                    ImageUrl = c.ImageUrl
                })
                .ToListAsync();

            return items.AsReadOnly();
        }

        public async Task<IReadOnlyCollection<PostCategoryDto>> GetPostCategoriesAsync()
        {
            var items = await _db.PostCategories
                .AsNoTracking()
                .Include(c => c.Parent)
                .OrderBy(c => c.Name)
                .Select(c => new PostCategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Slug = c.Slug,
                    Description = c.Description,
                    ParentId = c.ParentId,
                    ParentName = c.Parent != null ? c.Parent.Name : null
                })
                .ToListAsync();

            return items.AsReadOnly();
        }

        public async Task<IReadOnlyCollection<ProductCategoryDto>> GetProductCategoriesTreeAsync()
        {
            var allItems = await _db.ProductCategories
                .AsNoTracking()
                .Include(c => c.Parent)
                .OrderBy(c => c.Name)
                .Select(c => new ProductCategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Slug = c.Slug,
                    Description = c.Description,
                    ParentId = c.ParentId,
                    ParentName = c.Parent != null ? c.Parent.Name : null,
                    ImageUrl = c.ImageUrl
                })
                .ToListAsync();

            var itemMap = allItems.ToDictionary(c => c.Id);
            var rootItems = new List<ProductCategoryDto>();

            foreach (var item in allItems)
            {
                if (item.ParentId.HasValue && itemMap.TryGetValue(item.ParentId.Value, out var parent))
                {
                    parent.Children.Add(item);
                }
                else
                {
                    rootItems.Add(item);
                }
            }

            return rootItems.AsReadOnly();
        }

        public async Task<IReadOnlyCollection<PostCategoryDto>> GetPostCategoriesTreeAsync()
        {
            var allItems = await _db.PostCategories
                .AsNoTracking()
                .Include(c => c.Parent)
                .OrderBy(c => c.Name)
                .Select(c => new PostCategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Slug = c.Slug,
                    Description = c.Description,
                    ParentId = c.ParentId,
                    ParentName = c.Parent != null ? c.Parent.Name : null
                })
                .ToListAsync();

            var itemMap = allItems.ToDictionary(c => c.Id);
            var rootItems = new List<PostCategoryDto>();

            foreach (var item in allItems)
            {
                if (item.ParentId.HasValue && itemMap.TryGetValue(item.ParentId.Value, out var parent))
                {
                    parent.Children.Add(item);
                }
                else
                {
                    rootItems.Add(item);
                }
            }

            return rootItems.AsReadOnly();
        }
    }
}
