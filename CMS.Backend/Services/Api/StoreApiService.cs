using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CMS.Data;
using CMS.Backend.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Services.Api
{
    public sealed class StoreApiService : IStoreApiService
    {
        private readonly ApplicationDbContext _db;

        public StoreApiService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<IReadOnlyCollection<StoreDto>> GetAllStoresAsync()
        {
            var items = await _db.Stores
                .AsNoTracking()
                .OrderBy(s => s.Name)
                .Select(s => new StoreDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Address = s.Address,
                    Phone = s.Phone,
                    Province = s.Province,
                    District = s.District,
                    ImageUrl = s.ImageUrl,
                    GoogleMapUrl = s.GoogleMapUrl,
                    OpeningTime = s.OpeningTime.ToString(@"hh\:mm"),
                    ClosingTime = s.ClosingTime.ToString(@"hh\:mm"),
                    Latitude = s.Latitude,
                    Longitude = s.Longitude
                })
                .ToListAsync();

            return items.AsReadOnly();
        }
    }
}
