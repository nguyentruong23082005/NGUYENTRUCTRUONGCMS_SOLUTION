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
        public async Task<IActionResult> Index(int page = 1)
        {
            const int pageSize = 10;
            var products = await PaginatedList<Product>.CreateAsync(
                _context.Products
                    .Include(p => p.CategoryProduct)
                    .AsNoTracking()
                    .OrderBy(p => p.Name),
                page,
                pageSize);

            return View(products);
        }

        // GET: /Product/Create
        public IActionResult Create()
        {
            ViewBag.CategoryProductId = new SelectList(_context.CategoriesProducts, "Id", "Name");
            return View();
        }

        // POST: /Product/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(Product model)
        {
            if (ModelState.IsValid)
            {
                _context.Products.Add(model);
                _context.SaveChanges();
                return RedirectToAction(nameof(Index));
            }
            ViewBag.CategoryProductId = new SelectList(_context.CategoriesProducts, "Id", "Name", model.CategoryProductId);
            return View(model);
        }

        // GET: /Product/Edit/5
        public IActionResult Edit(int id)
        {
            var product = _context.Products.Find(id);
            if (product == null) return NotFound();
            
            ViewBag.CategoryProductId = new SelectList(_context.CategoriesProducts, "Id", "Name", product.CategoryProductId);
            return View(product);
        }

        // POST: /Product/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(int id, Product model)
        {
            if (id != model.Id) return NotFound();

            if (ModelState.IsValid)
            {
                _context.Products.Update(model);
                _context.SaveChanges();
                return RedirectToAction(nameof(Index));
            }
            ViewBag.CategoryProductId = new SelectList(_context.CategoriesProducts, "Id", "Name", model.CategoryProductId);
            return View(model);
        }

        // POST: /Product/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Delete(int id)
        {
            var product = _context.Products.Find(id);
            if (product == null) return NotFound();

            // Kiểm tra khóa ngoại từ OrderDetails
            var hasOrders = _context.OrderDetails.Any(od => od.ProductId == id);
            if (hasOrders)
            {
                TempData["ErrorMessage"] = $"Không thể xóa sản phẩm '{product.Name}' vì đã có người đặt mua (nằm trong chi tiết đơn hàng).";
                return RedirectToAction(nameof(Index));
            }

            _context.Products.Remove(product);
            _context.SaveChanges();
            TempData["SuccessMessage"] = $"Đã xóa sản phẩm '{product.Name}'.";
            return RedirectToAction(nameof(Index));
        }
    }
}
