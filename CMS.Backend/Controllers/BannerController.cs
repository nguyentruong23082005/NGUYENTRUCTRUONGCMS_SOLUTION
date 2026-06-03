using CMS.Backend.Models;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    [Authorize]
    public class BannerController : Controller
    {
        private readonly ApplicationDbContext _context;

        public BannerController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index(int page = 1)
        {
            const int pageSize = 10;
            var banners = await PaginatedList<Banner>.CreateAsync(
                _context.Banners
                    .AsNoTracking()
                    .OrderBy(b => b.Position)
                    .ThenBy(b => b.SortOrder)
                    .ThenByDescending(b => b.CreatedAt),
                page,
                pageSize);

            return View(banners);
        }

        public IActionResult Create()
        {
            var nextSortOrder = (_context.Banners
                .Where(b => b.Position == "HomeHero")
                .Select(b => (int?)b.SortOrder)
                .Max() ?? 0) + 1;

            return View(new Banner
            {
                Position = "HomeHero",
                SortOrder = nextSortOrder,
                IsActive = true
            });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(Banner model)
        {
            NormalizeBanner(model);
            ValidateBanner(model);

            if (!ModelState.IsValid) return View(model);

            _context.Banners.Add(model);
            _context.SaveChanges();
            TempData["SuccessMessage"] = $"Đã tạo banner '{model.Title}'.";
            return RedirectToAction(nameof(Index));
        }

        public IActionResult Edit(int id)
        {
            var banner = _context.Banners.Find(id);
            if (banner == null) return NotFound();

            return View(banner);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(int id, Banner model)
        {
            if (id != model.Id) return NotFound();

            NormalizeBanner(model);
            ValidateBanner(model, id);

            if (!ModelState.IsValid) return View(model);

            _context.Banners.Update(model);
            _context.SaveChanges();
            TempData["SuccessMessage"] = $"Đã cập nhật banner '{model.Title}'.";
            return RedirectToAction(nameof(Index));
        }

        public IActionResult Details(int id)
        {
            var banner = _context.Banners.AsNoTracking().FirstOrDefault(b => b.Id == id);
            if (banner == null) return NotFound();

            return View(banner);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Delete(int id)
        {
            var banner = _context.Banners.Find(id);
            if (banner == null) return NotFound();

            _context.Banners.Remove(banner);
            _context.SaveChanges();
            TempData["SuccessMessage"] = $"Đã chuyển banner '{banner.Title}' vào thùng rác.";
            return RedirectToAction(nameof(Index));
        }

        public async Task<IActionResult> Trash(int page = 1)
        {
            const int pageSize = 10;
            var banners = await PaginatedList<Banner>.CreateAsync(
                _context.Banners
                    .IgnoreQueryFilters()
                    .Where(b => b.IsDeleted)
                    .AsNoTracking()
                    .OrderByDescending(b => b.DeletedAt),
                page,
                pageSize);

            return View(banners);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Restore(int id)
        {
            var banner = _context.Banners
                .IgnoreQueryFilters()
                .FirstOrDefault(b => b.Id == id && b.IsDeleted);

            if (banner == null) return NotFound();

            var hasConflict = _context.Banners.Any(b =>
                b.Id != banner.Id &&
                b.ImageUrl == banner.ImageUrl &&
                b.Position == banner.Position);

            if (hasConflict)
            {
                TempData["ErrorMessage"] = $"Không thể khôi phục banner '{banner.Title}' vì ảnh này đã tồn tại ở vị trí {banner.Position}.";
                return RedirectToAction(nameof(Trash));
            }

            banner.IsDeleted = false;
            banner.DeletedAt = null;
            banner.UpdatedAt = DateTime.UtcNow;
            _context.SaveChanges();

            TempData["SuccessMessage"] = $"Đã khôi phục banner '{banner.Title}'.";
            return RedirectToAction(nameof(Trash));
        }

        private void ValidateBanner(Banner model, int? currentId = null)
        {
            if (string.IsNullOrWhiteSpace(model.Title))
            {
                ModelState.AddModelError(nameof(Banner.Title), "Vui lòng nhập tên banner.");
            }

            if (string.IsNullOrWhiteSpace(model.ImageUrl))
            {
                ModelState.AddModelError(nameof(Banner.ImageUrl), "Vui lòng nhập URL ảnh banner.");
            }
            else if (!Uri.TryCreate(model.ImageUrl, UriKind.Absolute, out var imageUri) ||
                     (imageUri.Scheme != Uri.UriSchemeHttp && imageUri.Scheme != Uri.UriSchemeHttps))
            {
                ModelState.AddModelError(nameof(Banner.ImageUrl), "URL ảnh phải bắt đầu bằng http hoặc https.");
            }

            if (!string.IsNullOrWhiteSpace(model.LinkUrl) &&
                (!Uri.TryCreate(model.LinkUrl, UriKind.Absolute, out var linkUri) ||
                 (linkUri.Scheme != Uri.UriSchemeHttp && linkUri.Scheme != Uri.UriSchemeHttps)))
            {
                ModelState.AddModelError(nameof(Banner.LinkUrl), "Link banner phải bắt đầu bằng http hoặc https.");
            }

            if (string.IsNullOrWhiteSpace(model.Position))
            {
                ModelState.AddModelError(nameof(Banner.Position), "Vui lòng nhập vị trí hiển thị.");
            }

            if (model.SortOrder < 0)
            {
                ModelState.AddModelError(nameof(Banner.SortOrder), "Thứ tự hiển thị không được âm.");
            }

            if (model.StartsAt.HasValue && model.EndsAt.HasValue && model.StartsAt > model.EndsAt)
            {
                ModelState.AddModelError(nameof(Banner.EndsAt), "Thời điểm kết thúc phải sau thời điểm bắt đầu.");
            }

            var duplicateExists = _context.Banners.Any(b =>
                b.ImageUrl == model.ImageUrl &&
                b.Position == model.Position &&
                (!currentId.HasValue || b.Id != currentId.Value));

            if (duplicateExists)
            {
                ModelState.AddModelError(nameof(Banner.ImageUrl), "Banner này đã tồn tại ở cùng vị trí hiển thị.");
            }
        }

        private static void NormalizeBanner(Banner model)
        {
            model.Title = (model.Title ?? string.Empty).Trim();
            model.ImageUrl = (model.ImageUrl ?? string.Empty).Trim();
            model.LinkUrl = string.IsNullOrWhiteSpace(model.LinkUrl) ? null : model.LinkUrl.Trim();
            model.Position = (model.Position ?? string.Empty).Trim();
        }
    }
}
