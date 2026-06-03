
using CMS.Backend.Models;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace CMS.Backend.Controllers
{
    [Authorize]
    public class StockController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly StockSettings _settings;

        public StockController(ApplicationDbContext context, IOptions<StockSettings> settings)
        {
            _context = context;
            _settings = settings.Value;
        }

        // GET: /Stock
        public async Task<IActionResult> Index(int? categoryId, string? search, int page = 1)
        {
            const int pageSize = 10;
            ViewBag.LowStockThreshold = _settings.LowStockThreshold;

            var query = _context.Products
                .Include(p => p.ProductCategory)
                .Include(p => p.ProductOptionGroups!)
                    .ThenInclude(pog => pog.OptionGroup!)
                        .ThenInclude(og => og.OptionValues)
                .AsNoTracking()
                .AsQueryable();

            if (categoryId.HasValue)
            {
                query = query.Where(p => p.ProductCategoryId == categoryId.Value);
                ViewBag.FilterCategoryId = categoryId.Value;
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(p => p.Name.Contains(term));
                ViewBag.Search = term;
            }

            var products = await PaginatedList<Product>.CreateAsync(
                query.OrderBy(p => p.Name),
                page,
                pageSize
            );

            ViewBag.Categories = await _context.ProductCategories.AsNoTracking().ToListAsync();
            return View(products);
        }

        // POST: /Stock/UpdateProductStock
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateProductStock(int id, int stock)
        {
            if (stock < 0)
            {
                return Json(new { success = false, message = "Số lượng tồn kho không được âm." });
            }

            try
            {
                var rowsAffected = await _context.Products
                    .Where(p => p.Id == id)
                    .ExecuteUpdateAsync(s => s.SetProperty(p => p.StockQuantity, stock));

                if (rowsAffected > 0)
                {
                    return Json(new { success = true, newStock = stock });
                }

                return Json(new { success = false, message = "Không tìm thấy sản phẩm." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }

        // POST: /Stock/UpdateOptionStock
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateOptionStock(int id, int? stock)
        {
            if (stock.HasValue && stock.Value < 0)
            {
                return Json(new { success = false, message = "Số lượng tùy chọn không được âm." });
            }

            try
            {
                var rowsAffected = await _context.OptionValues
                    .Where(o => o.Id == id)
                    .ExecuteUpdateAsync(s => s.SetProperty(o => o.StockQuantity, stock));

                if (rowsAffected > 0)
                {
                    return Json(new { success = true, newStock = stock });
                }

                return Json(new { success = false, message = "Không tìm thấy tùy chọn." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }
    }
}
