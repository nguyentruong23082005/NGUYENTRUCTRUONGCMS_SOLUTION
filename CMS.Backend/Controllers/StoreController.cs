using CMS.Backend.Models;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Globalization;

namespace CMS.Backend.Controllers
{
    [Authorize]
    public class StoreController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly Services.Shipping.IGhnShippingService _shippingService;

        public StoreController(ApplicationDbContext context, Services.Shipping.IGhnShippingService shippingService)
        {
            _context = context;
            _shippingService = shippingService;
        }

        public async Task<IActionResult> Index([FromQuery] StoreFilterModel filter, int page = 1)
        {
            // Tự động bổ sung GhnDistrictId cho các cửa hàng chưa có (Self-healing)
            var storesWithoutGhn = await _context.Stores
                .Where(s => !s.IsDeleted && s.GhnDistrictId == null)
                .ToListAsync();

            if (storesWithoutGhn.Any())
            {
                foreach (var store in storesWithoutGhn)
                {
                    await ResolveGhnDistrictIdAsync(store);
                }
                await _context.SaveChangesAsync();
            }

            const int pageSize = 10;
            filter ??= new StoreFilterModel();

            var query = _context.Stores.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var term = filter.Search.Trim().ToLower();
                query = query.Where(s => s.Name.ToLower().Contains(term) || 
                                         s.Address.ToLower().Contains(term));
            }

            var stores = await PaginatedList<Store>.CreateAsync(
                query.OrderBy(s => s.Name),
                page,
                pageSize);

            var viewModel = new StoreIndexViewModel
            {
                Stores = stores,
                Filter = filter
            };

            return View(viewModel);
        }

        public IActionResult Create()
        {
            return View(new Store
            {
                OpeningTime = new TimeSpan(7, 0, 0),
                ClosingTime = new TimeSpan(22, 0, 0)
            });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Store model)
        {
            ValidateStoreHours(model);

            if (!ModelState.IsValid) return View(model);

            // Tự động giải quyết GhnDistrictId
            await ResolveGhnDistrictIdAsync(model);

            _context.Stores.Add(model);
            await _context.SaveChangesAsync();
            TempData["SuccessMessage"] = $"Đã tạo cửa hàng '{model.Name}'.";
            return RedirectToAction(nameof(Index));
        }

        public IActionResult Edit(int id)
        {
            var store = _context.Stores.Find(id);
            if (store == null) return NotFound();

            return View(store);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, Store model)
        {
            if (id != model.Id) return NotFound();

            ValidateStoreHours(model);
            if (!ModelState.IsValid) return View(model);

            // Tự động giải quyết GhnDistrictId
            await ResolveGhnDistrictIdAsync(model);

            _context.Stores.Update(model);
            await _context.SaveChangesAsync();
            TempData["SuccessMessage"] = $"Đã cập nhật cửa hàng '{model.Name}'.";
            return RedirectToAction(nameof(Index));
        }

        public IActionResult Details(int id)
        {
            var store = _context.Stores.AsNoTracking().FirstOrDefault(s => s.Id == id);
            if (store == null) return NotFound();

            return View(store);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Delete(int id)
        {
            var store = _context.Stores.Find(id);
            if (store == null) return NotFound();

            _context.Stores.Remove(store);
            _context.SaveChanges();
            TempData["SuccessMessage"] = $"Đã chuyển cửa hàng '{store.Name}' vào thùng rác.";
            return RedirectToAction(nameof(Index));
        }

        public async Task<IActionResult> Trash(int page = 1)
        {
            const int pageSize = 10;
            var stores = await PaginatedList<Store>.CreateAsync(
                _context.Stores
                    .IgnoreQueryFilters()
                    .Where(s => s.IsDeleted)
                    .AsNoTracking()
                    .OrderByDescending(s => s.DeletedAt),
                page,
                pageSize);

            return View(stores);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Restore(int id)
        {
            var store = _context.Stores
                .IgnoreQueryFilters()
                .FirstOrDefault(s => s.Id == id && s.IsDeleted);

            if (store == null) return NotFound();

            store.IsDeleted = false;
            store.DeletedAt = null;
            store.UpdatedAt = DateTime.UtcNow;
            _context.SaveChanges();

            TempData["SuccessMessage"] = $"Đã khôi phục cửa hàng '{store.Name}'.";
            return RedirectToAction(nameof(Trash));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Geocode(int id)
        {
            var store = await _context.Stores.FindAsync(id);
            if (store == null) return NotFound();

            var (lat, lng) = await GeocodeAddressWithFallbacksAsync(store.Address, store.Ward, store.District, store.Province);

            if (lat.HasValue && lng.HasValue)
            {
                store.Latitude = lat;
                store.Longitude = lng;
                store.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                TempData["SuccessMessage"] = $"Đã định vị thành công '{store.Name}': ({lat.Value.ToString(CultureInfo.InvariantCulture)}, {lng.Value.ToString(CultureInfo.InvariantCulture)}).";
            }
            else
            {
                string fullAddress = $"{store.Address}, {store.Ward}, {store.District}, {store.Province}";
                TempData["ErrorMessage"] = $"Không tìm thấy tọa độ cho địa chỉ: {fullAddress}";
            }

            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> GeocodeAll()
        {
            var stores = await _context.Stores
                .Where(s => s.Latitude == null || s.Longitude == null || s.Latitude == 0 || s.Longitude == 0)
                .ToListAsync();

            int successCount = 0;
            int failCount = 0;

            foreach (var store in stores)
            {
                var (lat, lng) = await GeocodeAddressWithFallbacksAsync(store.Address, store.Ward, store.District, store.Province);

                if (lat.HasValue && lng.HasValue)
                {
                    store.Latitude = lat;
                    store.Longitude = lng;
                    store.UpdatedAt = DateTime.UtcNow;
                    successCount++;
                }
                else
                {
                    failCount++;
                }

                // Chờ 1 giây để tuân thủ Rate Limit của Nominatim
                await Task.Delay(1000);
            }

            if (successCount > 0)
            {
                await _context.SaveChangesAsync();
            }

            TempData["SuccessMessage"] = $"Đồng bộ tọa độ xong: Thành công {successCount} cửa hàng, thất bại {failCount} cửa hàng.";
            return RedirectToAction(nameof(Index));
        }

        private async Task<(double? Lat, double? Lng)> GeocodeAddressWithFallbacksAsync(string streetAddress, string? ward, string? district, string? province)
        {
            var queries = new List<string>();

            // Phương án 1: Toàn bộ địa chỉ đầy đủ (gốc)
            string full = $"{streetAddress}, {ward}, {district}, {province}".Trim(' ', ',');
            queries.Add(full);

            // Làm sạch các cấp hành chính
            string cWard = CleanAdminPrefix(ward);
            string cDistrict = CleanAdminPrefix(district);
            string cProvince = CleanAdminPrefix(province);

            // Phương án 2: Toàn bộ địa chỉ đầy đủ (làm sạch hành chính)
            string fullCleaned = $"{streetAddress}, {cWard}, {cDistrict}, {cProvince}".Trim(' ', ',');
            queries.Add(fullCleaned);

            // Phương án 3: Tách địa chỉ đường bằng dấu phẩy, lấy các đoạn từ phải qua trái
            if (!string.IsNullOrEmpty(streetAddress) && streetAddress.Contains(','))
            {
                var parts = streetAddress.Split(',')
                    .Select(p => p.Trim())
                    .Where(p => !string.IsNullOrEmpty(p))
                    .ToList();

                for (int i = 1; i < parts.Count; i++)
                {
                    var subStreet = string.Join(", ", parts.Skip(parts.Count - i));
                    queries.Add($"{subStreet}, {ward}, {district}, {province}".Trim(' ', ','));
                    queries.Add($"{subStreet}, {cWard}, {cDistrict}, {cProvince}".Trim(' ', ','));
                }
            }

            // Phương án 4: Làm sạch số phòng, tầng, block...
            string cleanedStreet = CleanStreetAddress(streetAddress);
            if (cleanedStreet != streetAddress && !string.IsNullOrWhiteSpace(cleanedStreet))
            {
                queries.Add($"{cleanedStreet}, {ward}, {district}, {province}".Trim(' ', ','));
                queries.Add($"{cleanedStreet}, {cWard}, {cDistrict}, {cProvince}".Trim(' ', ','));
            }

            // Phương án 4.5: Chiết xuất tên đường (bỏ số nhà)
            string streetName = ExtractStreetName(streetAddress);
            if (streetName != streetAddress && !string.IsNullOrWhiteSpace(streetName))
            {
                queries.Add($"{streetName}, {ward}, {district}, {province}".Trim(' ', ','));
                queries.Add($"{streetName}, {cWard}, {cDistrict}, {cProvince}".Trim(' ', ','));
            }

            // Phương án 5: Chỉ dùng Phường, Quận, Tỉnh
            string areaOnly = $"{ward}, {district}, {province}".Trim(' ', ',');
            queries.Add(areaOnly);
            string areaCleaned = $"{cWard}, {cDistrict}, {cProvince}".Trim(' ', ',');
            queries.Add(areaCleaned);

            // Phương án 6: Chỉ dùng Quận, Tỉnh
            string districtProvinceOnly = $"{district}, {province}".Trim(' ', ',');
            queries.Add(districtProvinceOnly);
            string distProvCleaned = $"{cDistrict}, {cProvince}".Trim(' ', ',');
            queries.Add(distProvCleaned);

            var distinctQueries = queries.Where(q => !string.IsNullOrWhiteSpace(q)).Distinct().ToList();

            for (int i = 0; i < distinctQueries.Count; i++)
            {
                var query = distinctQueries[i];
                var (lat, lng) = await GeocodeAddressAsync(query);
                if (lat.HasValue && lng.HasValue)
                {
                    return (lat, lng);
                }

                if (i < distinctQueries.Count - 1)
                {
                    await Task.Delay(1000);
                }
            }

            return (null, null);
        }

        private string CleanAdminPrefix(string? input)
        {
            if (string.IsNullOrEmpty(input)) return "";
            string res = System.Text.RegularExpressions.Regex.Replace(input, @"^(phường|xã|quận|huyện|thành phố|tp\.?|tỉnh|thị xã)\s+", "", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            return res.Trim();
        }

        private string CleanStreetAddress(string street)
        {
            if (string.IsNullOrEmpty(street)) return "";
            string res = System.Text.RegularExpressions.Regex.Replace(street, @"(?i)\b(tầng|lầu|block|lô|phòng|căn hộ|ki-ốt|kiốt|shopphouse|shopp-house|sh|gf|văn phòng|trệt|tòa nhà)\s*([a-z0-9\-–\svà,]+)\b", "", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            res = System.Text.RegularExpressions.Regex.Replace(res, @"\s+", " ");
            return res.Trim(' ', ',');
        }

        private string ExtractStreetName(string street)
        {
            if (string.IsNullOrEmpty(street)) return "";
            var match = System.Text.RegularExpressions.Regex.Match(street, @"(?i)\b(đường|phố|đại lộ|ấp|hẻm|ngõ|ngách)\s+.+");
            if (match.Success)
            {
                return match.Value;
            }
            return street;
        }

        private async Task<(double? Lat, double? Lng)> GeocodeAddressAsync(string address)
        {
            Console.WriteLine($"[GEOCODE] Querying address: {address}");
            try
            {
                using var client = new HttpClient();
                client.DefaultRequestHeaders.Add("User-Agent", "CMS.Backend/1.0 (nguyentruong23082005@gmail.com)");
                
                string url = $"https://nominatim.openstreetmap.org/search?q={Uri.EscapeDataString(address)}&format=json&limit=1";
                Console.WriteLine($"[GEOCODE] URL: {url}");
                var response = await client.GetAsync(url);
                Console.WriteLine($"[GEOCODE] Response Status: {response.StatusCode}");
                if (response.IsSuccessStatusCode)
                {
                    string content = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"[GEOCODE] Response Content: {content}");
                    using var doc = JsonDocument.Parse(content);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array && doc.RootElement.GetArrayLength() > 0)
                    {
                        var first = doc.RootElement[0];
                        if (first.TryGetProperty("lat", out var latProp) && first.TryGetProperty("lon", out var lonProp))
                        {
                            if (double.TryParse(latProp.GetString(), CultureInfo.InvariantCulture, out double lat) &&
                                double.TryParse(lonProp.GetString(), CultureInfo.InvariantCulture, out double lon))
                            {
                                Console.WriteLine($"[GEOCODE] Found coordinates: {lat}, {lon}");
                                return (lat, lon);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GEOCODE] Exception: {ex.Message}\n{ex.StackTrace}");
            }
            return (null, null);
        }

        private void ValidateStoreHours(Store model)
        {
            if (model.OpeningTime >= model.ClosingTime)
            {
                ModelState.AddModelError(nameof(Store.ClosingTime), "Giờ đóng cửa phải sau giờ mở cửa.");
            }
        }

        private async Task ResolveGhnDistrictIdAsync(Store store)
        {
            string? provinceName = store.Province;
            string? districtName = store.District;

            // Nếu các trường Province/District bị trống, tự động nhận diện từ trường Address
            if (string.IsNullOrWhiteSpace(provinceName) && !string.IsNullOrWhiteSpace(store.Address))
            {
                try
                {
                    var ghnProvinces = await _shippingService.GetProvincesAsync();
                    // Tìm tỉnh có tên nằm trong địa chỉ
                    var matchedProvince = ghnProvinces.FirstOrDefault(p => 
                        store.Address.Contains(p.ProvinceName, StringComparison.OrdinalIgnoreCase) ||
                        store.Address.Contains(CleanProvinceName(p.ProvinceName), StringComparison.OrdinalIgnoreCase));

                    if (matchedProvince != null)
                    {
                        provinceName = matchedProvince.ProvinceName;
                        store.Province = provinceName; // Lưu lại vào store

                        var ghnDistricts = await _shippingService.GetDistrictsAsync(matchedProvince.ProvinceID);
                        // Tìm quận/huyện có tên nằm trong địa chỉ
                        var matchedDistrict = ghnDistricts.FirstOrDefault(d => 
                            store.Address.Contains(d.DistrictName, StringComparison.OrdinalIgnoreCase) ||
                            store.Address.Contains(CleanDistrictName(d.DistrictName), StringComparison.OrdinalIgnoreCase));

                        if (matchedDistrict != null)
                        {
                            districtName = matchedDistrict.DistrictName;
                            store.District = districtName;
                            store.GhnDistrictId = matchedDistrict.DistrictID;
                        }
                        else if (ghnDistricts.Any())
                        {
                            // Fallback lấy quận/huyện đầu tiên của tỉnh đó để không bị null
                            var fallbackDistrict = ghnDistricts.First();
                            store.District = fallbackDistrict.DistrictName;
                            store.GhnDistrictId = fallbackDistrict.DistrictID;
                        }
                    }
                }
                catch
                {
                    // Bỏ qua nếu có lỗi kết nối GHN
                }
            }
            else if (!string.IsNullOrWhiteSpace(provinceName) && !string.IsNullOrWhiteSpace(districtName))
            {
                // Logic so khớp khi đã có Province và District đầy đủ
                try
                {
                    var ghnProvinces = await _shippingService.GetProvincesAsync();
                    var cleanStoreProvince = CleanAdministrativeName(provinceName);
                    var matchedProvince = ghnProvinces.FirstOrDefault(p => 
                        CleanAdministrativeName(p.ProvinceName).Contains(cleanStoreProvince) ||
                        cleanStoreProvince.Contains(CleanAdministrativeName(p.ProvinceName)));

                    if (matchedProvince != null)
                    {
                        var ghnDistricts = await _shippingService.GetDistrictsAsync(matchedProvince.ProvinceID);
                        var cleanStoreDistrict = CleanAdministrativeName(districtName);
                        var matchedDistrict = ghnDistricts.FirstOrDefault(d => 
                            CleanAdministrativeName(d.DistrictName).Contains(cleanStoreDistrict) ||
                            cleanStoreDistrict.Contains(CleanAdministrativeName(d.DistrictName)));

                        if (matchedDistrict != null)
                        {
                            store.GhnDistrictId = matchedDistrict.DistrictID;
                        }
                    }
                }
                catch
                {
                    // Bỏ qua nếu có lỗi kết nối GHN
                }
            }
        }

        private string CleanProvinceName(string name)
        {
            if (string.IsNullOrWhiteSpace(name)) return string.Empty;
            return name.Replace("Tỉnh", "", StringComparison.OrdinalIgnoreCase)
                       .Replace("Thành phố", "", StringComparison.OrdinalIgnoreCase)
                       .Trim();
        }

        private string CleanDistrictName(string name)
        {
            if (string.IsNullOrWhiteSpace(name)) return string.Empty;
            return name.Replace("Quận", "", StringComparison.OrdinalIgnoreCase)
                       .Replace("Huyện", "", StringComparison.OrdinalIgnoreCase)
                       .Replace("Thị xã", "", StringComparison.OrdinalIgnoreCase)
                       .Replace("Thành phố", "", StringComparison.OrdinalIgnoreCase)
                       .Trim();
        }

        private string CleanAdministrativeName(string name)
        {
            if (string.IsNullOrWhiteSpace(name)) return string.Empty;
            var cleaned = name.ToLower().Trim();
            string[] prefixes = { "tỉnh", "thành phố", "tp.", "tp", "t.", "quận", "q.", "huyện", "h.", "thị xã", "tx.", "phường", "p.", "xã", "x." };
            foreach (var prefix in prefixes)
            {
                if (cleaned.StartsWith(prefix))
                {
                    cleaned = cleaned.Substring(prefix.Length).Trim();
                }
            }
            return cleaned;
        }
    }
}
