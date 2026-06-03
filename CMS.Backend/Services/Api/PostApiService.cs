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
    public sealed class PostApiService : IPostApiService
    {
        private readonly ApplicationDbContext _db;

        public PostApiService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<PagedResult<PostDto>> GetPagedAsync(PostQuery query)
        {
            var dbQuery = _db.Posts
                .Include(p => p.PostCategory)
                .AsNoTracking();

            // Lọc theo Category
            if (query.CategoryId.HasValue)
            {
                dbQuery = dbQuery.Where(p => p.PostCategoryId == query.CategoryId.Value);
            }

            // Tìm kiếm theo từ khóa
            if (!string.IsNullOrWhiteSpace(query.Keyword))
            {
                string keyword = query.Keyword.Trim();
                dbQuery = dbQuery.Where(p => p.Title.Contains(keyword) || p.Content.Contains(keyword));
            }

            // Sắp xếp
            dbQuery = query.SortBy.ToLower() switch
            {
                "title" => query.SortOrder.ToLower() == "asc" ? dbQuery.OrderBy(p => p.Title) : dbQuery.OrderByDescending(p => p.Title),
                "createdat" => query.SortOrder.ToLower() == "asc" ? dbQuery.OrderBy(p => p.CreatedAt) : dbQuery.OrderByDescending(p => p.CreatedAt),
                _ => dbQuery.OrderByDescending(p => p.CreatedAt)
            };

            int totalItems = await dbQuery.CountAsync();

            var items = await dbQuery
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(p => new PostDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Slug = p.Slug,
                    Summary = p.Content.Length > 200 ? p.Content.Substring(0, 200) + "..." : p.Content,
                    ThumbnailUrl = p.ImageUrl,
                    PostCategoryName = p.PostCategory != null ? p.PostCategory.Name : null,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();

            return new PagedResult<PostDto>(items.AsReadOnly(), query.Page, query.PageSize, totalItems);
        }

        public async Task<PostDetailDto?> GetByIdAsync(int id)
        {
            return await _db.Posts
                .Include(p => p.PostCategory)
                .AsNoTracking()
                .Select(p => new PostDetailDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Slug = p.Slug,
                    Summary = p.Content.Length > 200 ? p.Content.Substring(0, 200) + "..." : p.Content,
                    ThumbnailUrl = p.ImageUrl,
                    PostCategoryName = p.PostCategory != null ? p.PostCategory.Name : null,
                    CreatedAt = p.CreatedAt,
                    Content = p.Content
                })
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<PostDetailDto?> GetBySlugAsync(string slug)
        {
            if (string.IsNullOrWhiteSpace(slug)) return null;

            return await _db.Posts
                .Include(p => p.PostCategory)
                .AsNoTracking()
                .Select(p => new PostDetailDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Slug = p.Slug,
                    Summary = p.Content.Length > 200 ? p.Content.Substring(0, 200) + "..." : p.Content,
                    ThumbnailUrl = p.ImageUrl,
                    PostCategoryName = p.PostCategory != null ? p.PostCategory.Name : null,
                    CreatedAt = p.CreatedAt,
                    Content = p.Content
                })
                .FirstOrDefaultAsync(p => p.Slug == slug);
        }
    }
}
