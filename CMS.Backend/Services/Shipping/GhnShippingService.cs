using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CMS.Backend.Services.Shipping
{
    public class GhnShippingService : IGhnShippingService
    {
        private readonly HttpClient _httpClient;
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<GhnShippingService> _logger;

        private readonly int _shopId;
        private readonly int _serviceTypeId;
        private readonly decimal _defaultFallbackFee;

        public GhnShippingService(
            HttpClient httpClient,
            ApplicationDbContext context,
            IConfiguration configuration,
            ILogger<GhnShippingService> logger)
        {
            _httpClient = httpClient;
            _context = context;
            _configuration = configuration;
            _logger = logger;

            var ghnConfig = _configuration.GetSection("GHN");
            _shopId = ghnConfig.GetValue<int>("ShopId");
            _serviceTypeId = ghnConfig.GetValue<int>("ServiceTypeId", 2);
            _defaultFallbackFee = ghnConfig.GetValue<decimal>("DefaultFallbackFee", 30000);
        }

        public async Task<List<GhnProvince>> GetProvincesAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("/shiip/public-api/master-data/province");
                response.EnsureSuccessStatusCode();

                var result = await response.Content.ReadFromJsonAsync<GhnResponse<List<GhnProvince>>>();
                return result?.Data ?? new List<GhnProvince>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching provinces from GHN API.");
                return new List<GhnProvince>();
            }
        }

        public async Task<List<GhnDistrict>> GetDistrictsAsync(int provinceId)
        {
            try
            {
                var response = await _httpClient.GetAsync($"/shiip/public-api/master-data/district?province_id={provinceId}");
                response.EnsureSuccessStatusCode();

                var result = await response.Content.ReadFromJsonAsync<GhnResponse<List<GhnDistrict>>>();
                return result?.Data ?? new List<GhnDistrict>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching districts from GHN API.");
                return new List<GhnDistrict>();
            }
        }

        public async Task<List<GhnWard>> GetWardsAsync(int districtId)
        {
            try
            {
                var response = await _httpClient.GetAsync($"/shiip/public-api/master-data/ward?district_id={districtId}");
                response.EnsureSuccessStatusCode();

                var result = await response.Content.ReadFromJsonAsync<GhnResponse<List<GhnWard>>>();
                return result?.Data ?? new List<GhnWard>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching wards from GHN API.");
                return new List<GhnWard>();
            }
        }

        public async Task<ShippingFeeResult> CalculateBestFeeAsync(int toDistrictId, string toWardCode, int totalWeightGram = 500, int? storeId = null)
        {
            // 1. Lấy cửa hàng được chỉ định hoặc tất cả cửa hàng có GhnDistrictId
            List<Store> stores;
            if (storeId.HasValue)
            {
                var specificStore = await _context.Stores
                    .FirstOrDefaultAsync(s => s.Id == storeId.Value && !s.IsDeleted && s.GhnDistrictId.HasValue);
                if (specificStore != null)
                {
                    stores = new List<Store> { specificStore };
                }
                else
                {
                    stores = await _context.Stores
                        .Where(s => !s.IsDeleted && s.GhnDistrictId.HasValue)
                        .ToListAsync();
                }
            }
            else
            {
                // Thử tìm các cửa hàng cùng Quận/Huyện trước để tối ưu hóa hiệu năng
                var sameDistrictStores = await _context.Stores
                    .Where(s => !s.IsDeleted && s.GhnDistrictId.HasValue && s.GhnDistrictId == toDistrictId)
                    .ToListAsync();

                if (sameDistrictStores.Any())
                {
                    stores = sameDistrictStores;
                }
                else
                {
                    // Nếu không có cửa hàng cùng quận, lấy tối đa 5 cửa hàng đầu tiên để tránh spam API
                    stores = await _context.Stores
                        .Where(s => !s.IsDeleted && s.GhnDistrictId.HasValue)
                        .Take(5)
                        .ToListAsync();
                }
            }

            if (!stores.Any())
            {
                _logger.LogWarning("No stores with GhnDistrictId found. Using fallback fee.");
                return CreateFallbackResult(null);
            }

            // 2. Gọi GHN API cho TẤT CẢ cửa hàng (chạy song song)
            var tasks = stores.Select(async store =>
            {
                try
                {
                    var fee = await GetShippingFeeAsync(store.GhnDistrictId.GetValueOrDefault(), toDistrictId, toWardCode, totalWeightGram);
                    return new { StoreEntity = store, Fee = fee, Success = true };
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, $"Failed to calculate fee for Store {store.Id} ({store.Name})");
                    return new { StoreEntity = store, Fee = 0m, Success = false };
                }
            });

            var results = await Task.WhenAll(tasks);
            var successfulResults = results.Where(r => r.Success).ToList();

            if (!successfulResults.Any())
            {
                // Fallback nếu GHN API down hoàn toàn
                var firstStore = stores.First();
                return CreateFallbackResult(firstStore);
            }

            // 3. Chọn cửa hàng có phí thấp nhất
            var bestOption = successfulResults.OrderBy(r => r.Fee).First();

            return new ShippingFeeResult
            {
                Fee = bestOption.Fee,
                NearestStoreId = bestOption.StoreEntity.Id,
                NearestStoreName = bestOption.StoreEntity.Name,
                IsEstimated = false
            };
        }

        private async Task<decimal> GetShippingFeeAsync(int fromDistrictId, int toDistrictId, string toWardCode, int weight)
        {
            var requestBody = new
            {
                service_type_id = _serviceTypeId,
                from_district_id = fromDistrictId,
                to_district_id = toDistrictId,
                to_ward_code = toWardCode,
                weight = weight
            };

            // Truyền ShopId vào header theo spec của GHN để tính phí dựa trên cấu hình shop
            var request = new HttpRequestMessage(HttpMethod.Post, "/shiip/public-api/v2/shipping-order/fee")
            {
                Content = JsonContent.Create(requestBody)
            };
            request.Headers.Add("ShopId", _shopId.ToString());

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError($"GHN Fee API returned error ({response.StatusCode}): {errorContent}. Request payload: fromDistrictId={fromDistrictId}, toDistrictId={toDistrictId}, toWardCode={toWardCode}, weight={weight}");
                response.EnsureSuccessStatusCode();
            }

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            
            if (doc.RootElement.TryGetProperty("data", out var dataElement) &&
                dataElement.TryGetProperty("total", out var totalElement))
            {
                return totalElement.GetDecimal();
            }

            throw new Exception("Invalid response format from GHN Fee API");
        }

        private ShippingFeeResult CreateFallbackResult(Store? store)
        {
            return new ShippingFeeResult
            {
                Fee = _defaultFallbackFee,
                NearestStoreId = store?.Id,
                NearestStoreName = store?.Name ?? "Kho trung tâm",
                IsEstimated = true
            };
        }
    }
}
