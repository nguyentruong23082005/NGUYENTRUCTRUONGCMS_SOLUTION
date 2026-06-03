using CMS.Backend.Models;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    [Authorize]
    public class StoreController : Controller
    {
        private readonly ApplicationDbContext _context;

        public StoreController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index([FromQuery] StoreFilterModel filter, int page = 1)
        {
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
        public IActionResult Create(Store model)
        {
            ValidateStoreHours(model);

            if (!ModelState.IsValid) return View(model);

            _context.Stores.Add(model);
            _context.SaveChanges();
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
        public IActionResult Edit(int id, Store model)
        {
            if (id != model.Id) return NotFound();

            ValidateStoreHours(model);
            if (!ModelState.IsValid) return View(model);

            _context.Stores.Update(model);
            _context.SaveChanges();
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

        private void ValidateStoreHours(Store model)
        {
            if (model.OpeningTime >= model.ClosingTime)
            {
                ModelState.AddModelError(nameof(Store.ClosingTime), "Giờ đóng cửa phải sau giờ mở cửa.");
            }
        }
    }
}
