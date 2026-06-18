using CMS.Backend.Models;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

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

            var query = _context.ProductCategories
                .Include(c => c.Parent)
                .AsNoTracking();

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
            ViewBag.ParentCategoryList = new SelectList(_context.ProductCategories.Where(c => !c.IsDeleted).ToList(), "Id", "Name");
            return View();
        }

        // POST: /ProductCategory/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(ProductCategory model, IFormFile? uploadImage)
        {
            if (ModelState.IsValid)
            {
                // Xử lý upload ảnh
                if (uploadImage != null && uploadImage.Length > 0)
                {
                    // 1. Kiểm tra kích thước (max 2MB)
                    if (uploadImage.Length > 2 * 1024 * 1024)
                    {
                        ModelState.AddModelError("ImageUrl", "Kích thước ảnh đại diện không được vượt quá 2MB.");
                        ViewBag.ParentCategoryList = new SelectList(_context.ProductCategories.Where(c => !c.IsDeleted).ToList(), "Id", "Name", model.ParentId);
                        return View(model);
                    }

                    // 2. Kiểm tra định dạng (jpg, jpeg, png, webp)
                    var extension = Path.GetExtension(uploadImage.FileName).ToLower();
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
                    if (!allowedExtensions.Contains(extension))
                    {
                        ModelState.AddModelError("ImageUrl", "Chỉ chấp nhận các định dạng ảnh: .jpg, .jpeg, .png, .webp.");
                        ViewBag.ParentCategoryList = new SelectList(_context.ProductCategories.Where(c => !c.IsDeleted).ToList(), "Id", "Name", model.ParentId);
                        return View(model);
                    }

                    // 3. Đường dẫn thư mục
                    string folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                    if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

                    // 4. Tạo tên file theo chuẩn SEO: category-slug-guid_sub.ext
                    string slug = CMS.Data.Helpers.SlugHelper.Generate(model.Name);
                    string fileName = $"category-{slug}-{Guid.NewGuid().ToString().Substring(0, 8)}{extension}";
                    string filePath = Path.Combine(folder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        uploadImage.CopyTo(stream);
                    }

                    model.ImageUrl = "/uploads/" + fileName;
                }

                _context.ProductCategories.Add(model);
                _context.SaveChanges();
                return RedirectToAction(nameof(Index));
            }

            ViewBag.ParentCategoryList = new SelectList(_context.ProductCategories.Where(c => !c.IsDeleted).ToList(), "Id", "Name", model.ParentId);
            return View(model);
        }

        // GET: /ProductCategory/Edit/5
        public IActionResult Edit(int id)
        {
            var category = _context.ProductCategories.Find(id);
            if (category == null) return NotFound();

            ViewBag.ParentCategoryList = new SelectList(
                _context.ProductCategories.Where(c => c.Id != id && !c.IsDeleted).ToList(), 
                "Id", 
                "Name", 
                category.ParentId);
            return View(category);
        }

        // POST: /ProductCategory/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, ProductCategory model, IFormFile? uploadImage)
        {
            if (id != model.Id) return NotFound();

            // Kiểm tra vòng lặp danh mục (Circular Reference)
            if (model.ParentId.HasValue && await IsCircularReference(model.Id, model.ParentId))
            {
                ModelState.AddModelError("ParentId", "Không thể chọn danh mục con hoặc chính nó làm danh mục cha (Lỗi vòng lặp cây danh mục).");
            }

            if (ModelState.IsValid)
            {
                var existingCategory = _context.ProductCategories.AsNoTracking().FirstOrDefault(c => c.Id == model.Id);
                if (existingCategory == null) return NotFound();

                if (uploadImage != null && uploadImage.Length > 0)
                {
                    // 1. Kiểm tra kích thước (max 2MB)
                    if (uploadImage.Length > 2 * 1024 * 1024)
                    {
                        ModelState.AddModelError("ImageUrl", "Kích thước ảnh đại diện không được vượt quá 2MB.");
                        ViewBag.ParentCategoryList = new SelectList(_context.ProductCategories.Where(c => c.Id != id && !c.IsDeleted).ToList(), "Id", "Name", model.ParentId);
                        return View(model);
                    }

                    // 2. Kiểm tra định dạng (jpg, jpeg, png, webp)
                    var extension = Path.GetExtension(uploadImage.FileName).ToLower();
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
                    if (!allowedExtensions.Contains(extension))
                    {
                        ModelState.AddModelError("ImageUrl", "Chỉ chấp nhận các định dạng ảnh: .jpg, .jpeg, .png, .webp.");
                        ViewBag.ParentCategoryList = new SelectList(_context.ProductCategories.Where(c => c.Id != id && !c.IsDeleted).ToList(), "Id", "Name", model.ParentId);
                        return View(model);
                    }

                    // 3. Xóa ảnh vật lý cũ nếu có
                    if (!string.IsNullOrEmpty(existingCategory.ImageUrl) && existingCategory.ImageUrl.StartsWith("/uploads/"))
                    {
                        var oldFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", existingCategory.ImageUrl.TrimStart('/'));
                        if (System.IO.File.Exists(oldFilePath))
                        {
                            try
                            {
                                System.IO.File.Delete(oldFilePath);
                            }
                            catch (Exception) { /* Ignored */ }
                        }
                    }

                    // 4. Lưu ảnh mới
                    string folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                    if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

                    string slug = CMS.Data.Helpers.SlugHelper.Generate(model.Name);
                    string fileName = $"category-{slug}-{Guid.NewGuid().ToString().Substring(0, 8)}{extension}";
                    string filePath = Path.Combine(folder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        uploadImage.CopyTo(stream);
                    }

                    model.ImageUrl = "/uploads/" + fileName;
                }
                else
                {
                    // Giữ lại ảnh cũ
                    model.ImageUrl = existingCategory.ImageUrl;
                }

                _context.ProductCategories.Update(model);
                _context.SaveChanges();
                return RedirectToAction(nameof(Index));
            }

            ViewBag.ParentCategoryList = new SelectList(
                _context.ProductCategories.Where(c => c.Id != id && !c.IsDeleted).ToList(), 
                "Id", 
                "Name", 
                model.ParentId);
            return View(model);
        }

        // POST: /ProductCategory/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Delete(int id)
        {
            var category = _context.ProductCategories
                .Include(c => c.Products)
                .Include(c => c.Children)
                .FirstOrDefault(c => c.Id == id);

            if (category == null) return NotFound();

            // 1. Chặn xóa danh mục khi có danh mục con thuộc danh mục này
            if (category.Children != null && category.Children.Any(c => !c.IsDeleted))
            {
                TempData["ErrorMessage"] = $"Không thể xóa danh mục '{category.Name}' vì đang có {category.Children.Count(c => !c.IsDeleted)} danh mục con trực thuộc.";
                return RedirectToAction(nameof(Index));
            }

            // 2. Chặn xóa danh mục khi vẫn còn sản phẩm thuộc danh mục đó.
            if (category.Products != null && category.Products.Any(p => !p.IsDeleted))
            {
                TempData["ErrorMessage"] = $"Không thể xóa danh mục '{category.Name}' vì đang có {category.Products.Count(p => !p.IsDeleted)} sản phẩm thuộc danh mục này.";
                return RedirectToAction(nameof(Index));
            }

            try
            {
                _context.ProductCategories.Remove(category);
                _context.SaveChanges();
                TempData["SuccessMessage"] = $"Đã xóa danh mục '{category.Name}'.";
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = $"Lỗi hệ thống khi xóa danh mục '{category.Name}': {ex.Message}";
            }

            return RedirectToAction(nameof(Index));
        }

        // GET: /ProductCategory/Trash
        public async Task<IActionResult> Trash(int page = 1)
        {
            const int pageSize = 10;
            var categories = await PaginatedList<ProductCategory>.CreateAsync(
                _context.ProductCategories
                    .IgnoreQueryFilters()
                    .Include(c => c.Parent)
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
                
                var cat = await _context.ProductCategories
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
