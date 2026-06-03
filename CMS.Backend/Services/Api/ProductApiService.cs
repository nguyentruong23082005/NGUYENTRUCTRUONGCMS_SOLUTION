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
                .AsNoTracking();

            // Lọc theo Category
            if (query.CategoryId.HasValue)
            {
                dbQuery = dbQuery.Where(p => p.ProductCategoryId == query.CategoryId.Value);
            }

            // Tìm kiếm theo từ khóa
            if (!string.IsNullOrWhiteSpace(query.Keyword))
            {
                string keyword = query.Keyword.Trim();
                dbQuery = dbQuery.Where(p => p.Name.Contains(keyword) || (p.Description != null && p.Description.Contains(keyword)));
            }

            // Sắp xếp
            dbQuery = query.SortBy.ToLower() switch
            {
                "name" => query.SortOrder.ToLower() == "asc" ? dbQuery.OrderBy(p => p.Name) : dbQuery.OrderByDescending(p => p.Name),
                "price" => query.SortOrder.ToLower() == "asc" ? dbQuery.OrderBy(p => p.Price) : dbQuery.OrderByDescending(p => p.Price),
                "createdat" => query.SortOrder.ToLower() == "asc" ? dbQuery.OrderBy(p => p.CreatedAt) : dbQuery.OrderByDescending(p => p.CreatedAt),
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
                    Description = p.Description
                })
                .ToListAsync();

            return new PagedResult<ProductDto>(items.AsReadOnly(), query.Page, query.PageSize, totalItems);
        }

        public async Task<ProductDto?> GetByIdAsync(int id)
        {
            return await _db.Products
                .Include(p => p.ProductCategory)
                .AsNoTracking()
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Slug = p.Slug,
                    Price = p.Price,
                    ImageUrl = p.ImageUrl,
                    ProductCategoryName = p.ProductCategory != null ? p.ProductCategory.Name : null,
                    Description = p.Description,
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
                .AsNoTracking()
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Slug = p.Slug,
                    Price = p.Price,
                    ImageUrl = p.ImageUrl,
                    ProductCategoryName = p.ProductCategory != null ? p.ProductCategory.Name : null,
                    Description = p.Description,
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
    }
}
