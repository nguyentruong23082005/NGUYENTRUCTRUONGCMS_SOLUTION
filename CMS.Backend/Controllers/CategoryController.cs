using CMS.Backend.Models;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    [Authorize] // Bắt buộc đăng nhập mới được vào (Buổi 5)
    public class CategoryController : Controller
    {
        // Khai báo biến để gọi Database
        private readonly ApplicationDbContext _context;

        // Tiêm Database vào Controller (Dependency Injection)
        public CategoryController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index([FromQuery] CategoryFilterModel filter, int page = 1)
        {
            const int pageSize = 10;
            filter ??= new CategoryFilterModel();

            var query = _context.PostCategories.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var term = filter.Search.Trim().ToLower();
                query = query.Where(c => c.Name.ToLower().Contains(term));
            }

            var categories = await PaginatedList<PostCategory>.CreateAsync(
                query.OrderBy(c => c.Id),
                page,
                pageSize);

            var viewModel = new CategoryIndexViewModel
            {
                Categories = categories,
                Filter = filter
            };

            return View(viewModel);
        }

        // GET: Category/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: Category/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(PostCategory category)
        {
            if (ModelState.IsValid)
            {
                _context.PostCategories.Add(category);
                _context.SaveChanges();
                return RedirectToAction(nameof(Index));
            }
            return View(category);
        }

        // GET: Category/Edit/5
        public IActionResult Edit(int id)
        {
            var category = _context.PostCategories.Find(id);
            if (category == null)
            {
                return NotFound();
            }
            return View(category);
        }

        // POST: Category/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(int id, PostCategory category)
        {
            if (id != category.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                _context.PostCategories.Update(category);
                _context.SaveChanges();
                return RedirectToAction(nameof(Index));
            }
            return View(category);
        }

        // POST: Category/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Delete(int id)
        {
            var category = _context.PostCategories.Find(id);
            if (category != null)
            {
                // Remove sẽ được ApplicationDbContext chuyển thành xóa mềm nếu entity kế thừa BaseEntity.
                _context.PostCategories.Remove(category);
                _context.SaveChanges();
            }
            return RedirectToAction(nameof(Index));
        }

        // GET: Category/Trash
        public async Task<IActionResult> Trash(int page = 1)
        {
            const int pageSize = 10;
            var categories = await PaginatedList<PostCategory>.CreateAsync(
                _context.PostCategories
                    .IgnoreQueryFilters()
                    .Where(c => c.IsDeleted)
                    .AsNoTracking()
                    .OrderByDescending(c => c.DeletedAt),
                page,
                pageSize);

            return View(categories);
        }

        // POST: Category/Restore/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Restore(int id)
        {
            var category = _context.PostCategories
                .IgnoreQueryFilters()
                .FirstOrDefault(c => c.Id == id && c.IsDeleted);

            if (category == null) return NotFound();

            category.IsDeleted = false;
            category.DeletedAt = null;
            category.UpdatedAt = DateTime.UtcNow;
            _context.SaveChanges();

            TempData["SuccessMessage"] = $"Đã khôi phục danh mục '{category.Name}'.";
            return RedirectToAction(nameof(Trash));
        }
    }
}