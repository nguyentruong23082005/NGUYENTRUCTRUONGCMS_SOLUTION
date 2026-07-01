using CMS.Backend.Models;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CMS.Backend.Controllers
{
    [Authorize]
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

            var query = _context.PostCategories
                .Include(c => c.Parent)
                .AsNoTracking();

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
            ViewBag.ParentCategoryList = new SelectList(_context.PostCategories.Where(c => !c.IsDeleted).ToList(), "Id", "Name");
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
            ViewBag.ParentCategoryList = new SelectList(_context.PostCategories.Where(c => !c.IsDeleted).ToList(), "Id", "Name", category.ParentId);
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
            ViewBag.ParentCategoryList = new SelectList(
                _context.PostCategories.Where(c => c.Id != id && !c.IsDeleted).ToList(), 
                "Id", 
                "Name", 
                category.ParentId);
            return View(category);
        }

        // POST: Category/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, PostCategory category)
        {
            if (id != category.Id)
            {
                return NotFound();
            }

            // Kiểm tra vòng lặp danh mục (Circular Reference)
            if (category.ParentId.HasValue && await IsCircularReference(category.Id, category.ParentId))
            {
                ModelState.AddModelError("ParentId", "Không thể chọn danh mục con hoặc chính nó làm danh mục cha (Lỗi vòng lặp cây danh mục).");
            }

            if (ModelState.IsValid)
            {
                _context.PostCategories.Update(category);
                _context.SaveChanges();
                return RedirectToAction(nameof(Index));
            }
            ViewBag.ParentCategoryList = new SelectList(
                _context.PostCategories.Where(c => c.Id != id && !c.IsDeleted).ToList(), 
                "Id", 
                "Name", 
                category.ParentId);
            return View(category);
        }

        // POST: Category/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Delete(int id)
        {
            var category = _context.PostCategories
                .Include(c => c.Posts)
                .Include(c => c.Children)
                .FirstOrDefault(c => c.Id == id);

            if (category == null) return NotFound();

            // 1. Chặn xóa danh mục khi có danh mục con
            if (category.Children != null && category.Children.Any(c => !c.IsDeleted))
            {
                TempData["ErrorMessage"] = $"Không thể xóa danh mục '{category.Name}' vì đang có {category.Children.Count(c => !c.IsDeleted)} danh mục con trực thuộc.";
                return RedirectToAction(nameof(Index));
            }

            // 2. Chặn xóa danh mục khi có bài viết liên quan
            if (category.Posts != null && category.Posts.Any(p => !p.IsDeleted))
            {
                TempData["ErrorMessage"] = $"Không thể xóa danh mục '{category.Name}' vì đang có {category.Posts.Count(p => !p.IsDeleted)} bài viết thuộc danh mục này.";
                return RedirectToAction(nameof(Index));
            }

            try
            {
                _context.PostCategories.Remove(category);
                _context.SaveChanges();
                TempData["SuccessMessage"] = $"Đã xóa danh mục '{category.Name}'.";
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = $"Lỗi hệ thống khi xóa danh mục '{category.Name}': {ex.Message}";
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
                    .Include(c => c.Parent)
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

        // Kiểm tra vòng lặp cây danh mục
        private async Task<bool> IsCircularReference(int categoryId, int? parentId)
        {
            if (!parentId.HasValue) return false;
            if (categoryId == parentId.Value) return true;

            var currentId = parentId;
            var visited = new HashSet<int> { categoryId };
            while (currentId.HasValue)
            {
                if (!visited.Add(currentId.Value)) return true; // Tránh loop vô hạn nếu DB đã hỏng sẵn
                
                var cat = await _context.PostCategories
                    .IgnoreQueryFilters()
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.Id == currentId.Value);
                if (cat == null) break;

                if (cat.ParentId == categoryId) return true;
                currentId = cat.ParentId;
            }
            return false;
        }
    }
}