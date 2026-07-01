using System.Collections.Generic;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace CMS.Backend.Services.Shipping
{
    public interface IGhnShippingService
    {
        Task<ShippingFeeResult> CalculateBestFeeAsync(int toDistrictId, string toWardCode, int totalWeightGram = 500, int? storeId = null);
        Task<List<GhnProvince>> GetProvincesAsync();
        Task<List<GhnDistrict>> GetDistrictsAsync(int provinceId);
        Task<List<GhnWard>> GetWardsAsync(int districtId);
    }

    public class ShippingFeeResult
    {
        public decimal Fee { get; set; }
        public int? NearestStoreId { get; set; }
        public string? NearestStoreName { get; set; }
        public bool IsEstimated { get; set; }
    }

    public class GhnProvince
    {
        [JsonPropertyName("ProvinceID")]
        public int ProvinceID { get; set; }

        [JsonPropertyName("ProvinceName")]
        public string ProvinceName { get; set; } = string.Empty;
    }

    public class GhnDistrict
    {
        [JsonPropertyName("DistrictID")]
        public int DistrictID { get; set; }

        [JsonPropertyName("ProvinceID")]
        public int ProvinceID { get; set; }

        [JsonPropertyName("DistrictName")]
        public string DistrictName { get; set; } = string.Empty;
    }

    public class GhnWard
    {
        [JsonPropertyName("WardCode")]
        public string WardCode { get; set; } = string.Empty;

        [JsonPropertyName("DistrictID")]
        public int DistrictID { get; set; }

        [JsonPropertyName("WardName")]
        public string WardName { get; set; } = string.Empty;
    }

    public class GhnResponse<T>
    {
        [JsonPropertyName("code")]
        public int Code { get; set; }

        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("data")]
        public T? Data { get; set; }
    }
}
