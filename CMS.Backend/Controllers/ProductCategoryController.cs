using CMS.Backend.Models;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    [Authorize]
    public class ProductCategoryController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ProductCategoryController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: /ProductCategory
        public async Task<IActionResult> Index([FromQuery] ProductCategoryFilterModel filter, int page = 1)
        {
            const int pageSize = 10;
            filter ??= new ProductCategoryFilterModel();

            var query = _context.ProductCategories.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var term = filter.Search.Trim().ToLower();
                query = query.Where(c => c.Name.ToLower().Contains(term));
            }

            var categories = await PaginatedList<ProductCategory>.CreateAsync(
                query.OrderBy(c => c.Name),
                page,
                pageSize);

            var viewModel = new ProductCategoryIndexViewModel
            {
                Categories = categories,
                Filter = filter
            };

            return View(viewModel);
        }

        // GET: /ProductCategory/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: /ProductCategory/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(ProductCategory model)
        {
            if (ModelState.IsValid)
            {
                _context.ProductCategories.Add(model);
                _context.SaveChanges();
                return RedirectToAction(nameof(Index));
            }
            return View(model);
        }

        // GET: /ProductCategory/Edit/5
        public IActionResult Edit(int id)
        {
            var category = _context.ProductCategories.Find(id);
            if (category == null) return NotFound();
            return View(category);
        }

        // POST: /ProductCategory/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(int id, ProductCategory model)
        {
            if (id != model.Id) return NotFound();

            if (ModelState.IsValid)
            {
                _context.ProductCategories.Update(model);
                _context.SaveChanges();
                return RedirectToAction(nameof(Index));
            }
            return View(model);
        }

        // POST: /ProductCategory/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Delete(int id)
        {
            var category = _context.ProductCategories
                .Include(c => c.Products)
                .FirstOrDefault(c => c.Id == id);

            if (category == null) return NotFound();

            // Chặn xóa danh mục khi vẫn còn sản phẩm thuộc danh mục đó.
            if (category.Products != null && category.Products.Any())
            {
                TempData["ErrorMessage"] = $"Không thể xóa danh mục '{category.Name}' vì đang có {category.Products.Count} sản phẩm thuộc danh mục này.";
                return RedirectToAction(nameof(Index));
            }

            _context.ProductCategories.Remove(category);
            _context.SaveChanges();
            TempData["SuccessMessage"] = $"Đã xóa danh mục '{category.Name}'.";
            return RedirectToAction(nameof(Index));
        }

        // GET: /ProductCategory/Trash
        public async Task<IActionResult> Trash(int page = 1)
        {
            const int pageSize = 10;
            var categories = await PaginatedList<ProductCategory>.CreateAsync(
                _context.ProductCategories
                    .IgnoreQueryFilters()
                    .Where(c => c.IsDeleted)
                    .AsNoTracking()
                    .OrderByDescending(c => c.DeletedAt),
                page,
                pageSize);

            return View(categories);
        }

        // POST: /ProductCategory/Restore/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Restore(int id)
        {
            var category = _context.ProductCategories
                .IgnoreQueryFilters()
                .FirstOrDefault(c => c.Id == id && c.IsDeleted);

            if (category == null) return NotFound();

            category.IsDeleted = false;
            category.DeletedAt = null;
            category.UpdatedAt = DateTime.UtcNow;
            _context.SaveChanges();

            TempData["SuccessMessage"] = $"Đã khôi phục danh mục sản phẩm '{category.Name}'.";
            return RedirectToAction(nameof(Trash));
        }
    }
}
