using CMS.Backend.Helpers;
using CMS.Backend.Models;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    [Authorize]
    public class ProductController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ProductController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: /Product
        public async Task<IActionResult> Index([FromQuery] ProductFilterModel filter, int page = 1)
        {
            const int pageSize = 10;
            filter ??= new ProductFilterModel();

            var query = _context.Products
                .Include(p => p.ProductCategory)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var term = filter.Search.Trim().ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(term));
            }

            if (filter.CategoryId.HasValue)
            {
                query = query.Where(p => p.ProductCategoryId == filter.CategoryId.Value);
            }

            var products = await PaginatedList<Product>.CreateAsync(
                query.OrderBy(p => p.Name),
                page,
                pageSize);

            var categories = await _context.ProductCategories
                .AsNoTracking()
                .OrderBy(c => c.Name)
                .ToListAsync();

            var viewModel = new ProductIndexViewModel
            {
                Products = products,
                Filter = filter,
                Categories = new SelectList(categories, "Id", "Name", filter.CategoryId)
            };

            return View(viewModel);
        }

        // GET: /Product/Create
        public IActionResult Create()
        {
            PopulateProductFormData();
            return View();
        }

        // POST: /Product/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(Product model, IFormFile? uploadImage)
        {
            if (ModelState.IsValid)
            {
                if (uploadImage != null && uploadImage.Length > 0)
                {
                    var uploadResult = ImageUploadHelper.SaveImage(uploadImage, filePrefix: "product");
                    if (!uploadResult.Succeeded)
                    {
                        ModelState.AddModelError(nameof(Product.ImageUrl), uploadResult.ErrorMessage ?? "Ảnh tải lên không hợp lệ.");
                        PopulateProductFormData(model.ProductCategoryId);
                        return View(model);
                    }

                    model.ImageUrl = uploadResult.Url;
                }

                _context.Products.Add(model);
                _context.SaveChanges();
                return RedirectToAction(nameof(Index));
            }
            PopulateProductFormData(model.ProductCategoryId);
            return View(model);
        }

        // GET: /Product/Edit/5
        public IActionResult Edit(int id)
        {
            var product = _context.Products
                .Include(p => p.ProductImages)
                .Include(p => p.ProductOptionGroups)!
                    .ThenInclude(pog => pog.OptionGroup)
                .FirstOrDefault(p => p.Id == id);

            if (product == null) return NotFound();

            PopulateProductFormData(product.ProductCategoryId, product.Id);
            return View(product);
        }

        // POST: /Product/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(int id, Product model, IFormFile? uploadImage)
        {
            if (id != model.Id) return NotFound();

            if (ModelState.IsValid)
            {
                if (uploadImage != null && uploadImage.Length > 0)
                {
                    var uploadResult = ImageUploadHelper.SaveImage(uploadImage, filePrefix: "product");
                    if (!uploadResult.Succeeded)
                    {
                        ModelState.AddModelError(nameof(Product.ImageUrl), uploadResult.ErrorMessage ?? "Ảnh tải lên không hợp lệ.");
                        PopulateProductFormData(model.ProductCategoryId, model.Id);
                        return View(model);
                    }

                    model.ImageUrl = uploadResult.Url;
                }
                else
                {
                    // Giữ lại ảnh cũ nếu không nhập ảnh mới
                    var oldProduct = _context.Products.AsNoTracking().FirstOrDefault(p => p.Id == model.Id);
                    if (oldProduct != null && string.IsNullOrEmpty(model.ImageUrl))
                    {
                        model.ImageUrl = oldProduct.ImageUrl;
                    }
                }

                _context.Products.Update(model);
                _context.SaveChanges();
                return RedirectToAction(nameof(Index));
            }

            PopulateProductFormData(model.ProductCategoryId, model.Id);
            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult AddImage(int productId, string imageUrl, IFormFile? uploadGalleryImage, bool isPrimary = false)
        {
            var product = _context.Products.Find(productId);
            if (product == null) return NotFound();

            string finalImageUrl = string.Empty;

            if (uploadGalleryImage != null && uploadGalleryImage.Length > 0)
            {
                var uploadResult = ImageUploadHelper.SaveImage(uploadGalleryImage, filePrefix: "product-gallery");
                if (!uploadResult.Succeeded)
                {
                    TempData["ErrorMessage"] = uploadResult.ErrorMessage ?? "Ảnh tải lên không hợp lệ.";
                    return RedirectToAction(nameof(Edit), new { id = productId });
                }

                finalImageUrl = uploadResult.Url ?? string.Empty;
            }
            else if (!string.IsNullOrWhiteSpace(imageUrl))
            {
                finalImageUrl = imageUrl.Trim();
                if (!ImageUploadHelper.IsSafeImageUrl(finalImageUrl))
                {
                    TempData["ErrorMessage"] = "URL ảnh phải là đường dẫn /uploads/ hoặc bắt đầu bằng http/https.";
                    return RedirectToAction(nameof(Edit), new { id = productId });
                }
            }
            else
            {
                TempData["ErrorMessage"] = "Vui lòng nhập URL ảnh hoặc tải lên tệp ảnh.";
                return RedirectToAction(nameof(Edit), new { id = productId });
            }

            if (isPrimary)
            {
                ClearPrimaryImages(productId);
            }

            _context.ProductImages.Add(new ProductImage
            {
                ProductId = productId,
                ImageUrl = finalImageUrl,
                IsPrimary = isPrimary
            });
            _context.SaveChanges();
            TempData["SuccessMessage"] = "Đã thêm ảnh sản phẩm.";
            return RedirectToAction(nameof(Edit), new { id = productId });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult RemoveImage(int imageId)
        {
            var image = _context.ProductImages.Find(imageId);
            if (image == null) return NotFound();

            var productId = image.ProductId;
            _context.ProductImages.Remove(image);
            _context.SaveChanges();
            TempData["SuccessMessage"] = "Đã chuyển ảnh sản phẩm vào thùng rác.";
            return RedirectToAction(nameof(Edit), new { id = productId });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult SetPrimaryImage(int imageId)
        {
            var image = _context.ProductImages.Find(imageId);
            if (image == null) return NotFound();

            ClearPrimaryImages(image.ProductId);
            image.IsPrimary = true;
            image.UpdatedAt = DateTime.UtcNow;
            _context.SaveChanges();
            TempData["SuccessMessage"] = "Đã đặt ảnh chính cho sản phẩm.";
            return RedirectToAction(nameof(Edit), new { id = image.ProductId });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult AttachOptionGroup(int productId, int optionGroupId)
        {
            var productExists = _context.Products.Any(p => p.Id == productId);
            var optionGroupExists = _context.OptionGroups.Any(g => g.Id == optionGroupId);
            if (!productExists || !optionGroupExists) return NotFound();

            var exists = _context.ProductOptionGroups.Any(pog =>
                pog.ProductId == productId && pog.OptionGroupId == optionGroupId);
            if (exists)
            {
                TempData["ErrorMessage"] = "Nhóm tùy chọn đã được gắn với sản phẩm này.";
                return RedirectToAction(nameof(Edit), new { id = productId });
            }

            _context.ProductOptionGroups.Add(new ProductOptionGroup
            {
                ProductId = productId,
                OptionGroupId = optionGroupId
            });
            _context.SaveChanges();
            TempData["SuccessMessage"] = "Đã gắn nhóm tùy chọn cho sản phẩm.";
            return RedirectToAction(nameof(Edit), new { id = productId });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult DetachOptionGroup(int productId, int optionGroupId)
        {
            var link = _context.ProductOptionGroups.FirstOrDefault(pog =>
                pog.ProductId == productId && pog.OptionGroupId == optionGroupId);
            if (link == null) return NotFound();

            _context.ProductOptionGroups.Remove(link);
            _context.SaveChanges();
            TempData["SuccessMessage"] = "Đã bỏ gắn nhóm tùy chọn khỏi sản phẩm.";
            return RedirectToAction(nameof(Edit), new { id = productId });
        }

        // POST: /Product/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Delete(int id)
        {
            var product = _context.Products.Find(id);
            if (product == null) return NotFound();

            // Xóa mềm sản phẩm để ẩn khỏi bán hàng/admin nhưng vẫn giữ lịch sử đơn hàng.
            _context.Products.Remove(product);
            _context.SaveChanges();
            TempData["SuccessMessage"] = $"Đã chuyển sản phẩm '{product.Name}' vào thùng rác.";
            return RedirectToAction(nameof(Index));
        }

        // GET: /Product/Trash
        public async Task<IActionResult> Trash(int page = 1)
        {
            const int pageSize = 10;
            var products = await PaginatedList<Product>.CreateAsync(
                _context.Products
                    .IgnoreQueryFilters()
                    .Include(p => p.ProductCategory)
                    .Where(p => p.IsDeleted)
                    .AsNoTracking()
                    .OrderByDescending(p => p.DeletedAt),
                page,
                pageSize);

            return View(products);
        }

        // POST: /Product/Restore/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Restore(int id)
        {
            var product = _context.Products
                .IgnoreQueryFilters()
                .FirstOrDefault(p => p.Id == id && p.IsDeleted);

            if (product == null) return NotFound();

            product.IsDeleted = false;
            product.DeletedAt = null;
            product.UpdatedAt = DateTime.UtcNow;
            _context.SaveChanges();

            TempData["SuccessMessage"] = $"Đã khôi phục sản phẩm '{product.Name}'.";
            return RedirectToAction(nameof(Trash));
        }

        private void PopulateProductFormData(int? selectedCategoryId = null, int? productId = null)
        {
            ViewBag.ProductCategoryId = new SelectList(
                _context.ProductCategories.AsNoTracking().OrderBy(c => c.Name),
                "Id",
                "Name",
                selectedCategoryId);

            var attachedGroupIds = productId.HasValue
                ? _context.ProductOptionGroups
                    .Where(pog => pog.ProductId == productId.Value)
                    .Select(pog => pog.OptionGroupId)
                    .ToList()
                : new List<int>();

            ViewBag.AvailableOptionGroups = new SelectList(
                _context.OptionGroups
                    .AsNoTracking()
                    .Where(g => !attachedGroupIds.Contains(g.Id))
                    .OrderBy(g => g.Name),
                "Id",
                "Name");
        }

        private void ClearPrimaryImages(int productId)
        {
            var primaryImages = _context.ProductImages
                .Where(i => i.ProductId == productId && i.IsPrimary);

            foreach (var image in primaryImages)
            {
                image.IsPrimary = false;
                image.UpdatedAt = DateTime.UtcNow;
            }
        }
    }
}
