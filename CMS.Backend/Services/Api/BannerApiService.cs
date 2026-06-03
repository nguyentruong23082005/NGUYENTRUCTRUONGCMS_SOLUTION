using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CMS.Data;
using CMS.Backend.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Services.Api
{
    public sealed class BannerApiService : IBannerApiService
    {
        private readonly ApplicationDbContext _db;

        public BannerApiService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<IReadOnlyCollection<BannerDto>> GetActiveBannersAsync()
        {
            var now = DateTime.UtcNow;

            var items = await _db.Banners
                .AsNoTracking()
                .Where(b => b.IsActive && 
                            (b.StartsAt == null || b.StartsAt <= now) && 
                            (b.EndsAt == null || b.EndsAt >= now))
                .OrderBy(b => b.SortOrder)
                .Select(b => new BannerDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    ImageUrl = b.ImageUrl,
                    LinkUrl = b.LinkUrl,
                    Position = b.Position,
                    SortOrder = b.SortOrder
                })
                .ToListAsync();

            return items.AsReadOnly();
        }
    }
}
