using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CMS.Data;
using CMS.Backend.Models.Api;
using CMS.Backend.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Services.Api
{
    public sealed class ProductApiService : IProductApiService
    {
        private readonly ApplicationDbContext _db;

        public ProductApiService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<PagedResult<ProductDto>> GetPagedAsync(ProductQuery query)
        {
            var dbQuery = _db.Products
                .Include(p => p.ProductCategory)
                    .ThenInclude(c => c!.Parent)
                .AsNoTracking();

            // Lọc theo Category (và tất cả danh mục con của nó)
            if (query.CategoryId.HasValue)
            {
                var categoryIds = await GetCategorySubtreeIdsAsync(query.CategoryId.Value);
                dbQuery = dbQuery.Where(p => categoryIds.Contains(p.ProductCategoryId));
            }
            else if (!string.IsNullOrWhiteSpace(query.CategorySlug))
            {
                var category = await _db.ProductCategories
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.Slug == query.CategorySlug);
                if (category != null)
                {
                    var categoryIds = await GetCategorySubtreeIdsAsync(category.Id);
                    dbQuery = dbQuery.Where(p => categoryIds.Contains(p.ProductCategoryId));
                }
                else
                {
                    dbQuery = dbQuery.Where(p => false);
                }
            }

            // Tìm kiếm theo từ khóa
            if (!string.IsNullOrWhiteSpace(query.Keyword))
            {
                string keyword = query.Keyword.Trim().ToLower();
                dbQuery = dbQuery.Where(p =>
                    p.Name.ToLower().Contains(keyword)
                    || (p.Description != null && p.Description.ToLower().Contains(keyword))
                    || (p.ProductCategory != null && p.ProductCategory.Name.ToLower().Contains(keyword)));
            }

            // Lọc theo khoảng giá (TC39)
            if (query.MinPrice.HasValue)
                dbQuery = dbQuery.Where(p => p.Price >= query.MinPrice.Value);
            if (query.MaxPrice.HasValue)
                dbQuery = dbQuery.Where(p => p.Price <= query.MaxPrice.Value);

            // Sắp xếp
            dbQuery = query.SortBy.ToLower() switch
            {
                "name" => query.SortOrder.ToLower() == "asc" ? dbQuery.OrderBy(p => p.Name) : dbQuery.OrderByDescending(p => p.Name),
                "price" => query.SortOrder.ToLower() == "asc" ? dbQuery.OrderBy(p => p.Price) : dbQuery.OrderByDescending(p => p.Price),
                "createdat" => query.SortOrder.ToLower() == "asc" ? dbQuery.OrderBy(p => p.CreatedAt) : dbQuery.OrderByDescending(p => p.CreatedAt),
                "totalsold" => query.SortOrder.ToLower() == "asc" ? dbQuery.OrderBy(p => p.TotalSold) : dbQuery.OrderByDescending(p => p.TotalSold),
                _ => dbQuery.OrderByDescending(p => p.CreatedAt)
            };

            int totalItems = await dbQuery.CountAsync();

            var items = await dbQuery
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Slug = p.Slug,
                    Price = p.Price,
                    ImageUrl = p.ImageUrl,
                    ProductCategoryName = p.ProductCategory != null ? p.ProductCategory.Name : null,
                    ProductCategoryImageUrl = p.ProductCategory != null
                        ? (p.ProductCategory.ImageUrl ?? (p.ProductCategory.Parent != null ? p.ProductCategory.Parent.ImageUrl : null))
                        : null,
                    Description = p.Description,
                    StockQuantity = p.StockQuantity,
                    TotalSold = p.TotalSold
                })
                .ToListAsync();

            return new PagedResult<ProductDto>(items.AsReadOnly(), query.Page, query.PageSize, totalItems);
        }

        public async Task<ProductDto?> GetByIdAsync(int id)
        {
            return await _db.Products
                .Include(p => p.ProductCategory)
                    .ThenInclude(c => c!.Parent)
                .AsNoTracking()
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Slug = p.Slug,
                    Price = p.Price,
                    ImageUrl = p.ImageUrl,
                    ProductCategoryName = p.ProductCategory != null ? p.ProductCategory.Name : null,
                    ProductCategoryImageUrl = p.ProductCategory != null
                        ? (p.ProductCategory.ImageUrl ?? (p.ProductCategory.Parent != null ? p.ProductCategory.Parent.ImageUrl : null))
                        : null,
                    Description = p.Description,
                    StockQuantity = p.StockQuantity,
                    TotalSold = p.TotalSold,
                    OptionGroups = p.ProductOptionGroups != null
                        ? p.ProductOptionGroups
                            .Select(pog => pog.OptionGroup)
                            .Where(og => og != null && !og.IsDeleted)
                            .Select(og => new OptionGroupDto
                            {
                                Id = og!.Id,
                                Name = og!.Name,
                                IsRequired = og!.IsRequired,
                                MaxSelectable = og!.MaxSelectable,
                                OptionValues = og!.OptionValues != null
                                    ? og!.OptionValues
                                        .Where(ov => !ov.IsDeleted && ov.IsActive)
                                        .Select(ov => new OptionValueDto
                                        {
                                            Id = ov.Id,
                                            Name = ov.Name,
                                            PriceSurcharge = ov.PriceSurcharge,
                                            StockQuantity = ov.StockQuantity
                                        })
                                        .ToList()
                                    : new List<OptionValueDto>()
                            })
                            .ToList()
                        : null
                })
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<ProductDto?> GetBySlugAsync(string slug)
        {
            if (string.IsNullOrWhiteSpace(slug)) return null;

            return await _db.Products
                .Include(p => p.ProductCategory)
                    .ThenInclude(c => c!.Parent)
                .AsNoTracking()
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Slug = p.Slug,
                    Price = p.Price,
                    ImageUrl = p.ImageUrl,
                    ProductCategoryName = p.ProductCategory != null ? p.ProductCategory.Name : null,
                    ProductCategoryImageUrl = p.ProductCategory != null
                        ? (p.ProductCategory.ImageUrl ?? (p.ProductCategory.Parent != null ? p.ProductCategory.Parent.ImageUrl : null))
                        : null,
                    Description = p.Description,
                    StockQuantity = p.StockQuantity,
                    TotalSold = p.TotalSold,
                    OptionGroups = p.ProductOptionGroups != null
                        ? p.ProductOptionGroups
                            .Select(pog => pog.OptionGroup)
                            .Where(og => og != null && !og.IsDeleted)
                            .Select(og => new OptionGroupDto
                            {
                                Id = og!.Id,
                                Name = og!.Name,
                                IsRequired = og!.IsRequired,
                                MaxSelectable = og!.MaxSelectable,
                                OptionValues = og!.OptionValues != null
                                    ? og!.OptionValues
                                        .Where(ov => !ov.IsDeleted && ov.IsActive)
                                        .Select(ov => new OptionValueDto
                                        {
                                            Id = ov.Id,
                                            Name = ov.Name,
                                            PriceSurcharge = ov.PriceSurcharge,
                                            StockQuantity = ov.StockQuantity
                                        })
                                        .ToList()
                                    : new List<OptionValueDto>()
                            })
                            .ToList()
                        : null
                })
                .FirstOrDefaultAsync(p => p.Slug == slug);
        }

        private async Task<List<int>> GetCategorySubtreeIdsAsync(int rootCategoryId)
        {
            var categories = await _db.ProductCategories
                .Select(c => new { c.Id, c.ParentId })
                .AsNoTracking()
                .ToListAsync();

            var result = new List<int> { rootCategoryId };
            var queue = new Queue<int>();
            queue.Enqueue(rootCategoryId);

            while (queue.Count > 0)
            {
                var currentId = queue.Dequeue();
                var childrenIds = categories
                    .Where(c => c.ParentId == currentId)
                    .Select(c => c.Id);

                foreach (var childId in childrenIds)
                {
                    if (!result.Contains(childId))
                    {
                        result.Add(childId);
                        queue.Enqueue(childId);
                    }
                }
            }

            return result;
        }
    }
}
