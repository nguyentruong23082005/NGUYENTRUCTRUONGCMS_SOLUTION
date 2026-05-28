using CMS.Backend.Models;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace CMS.Backend.Controllers
{
    [Authorize]
    public class OrderController : Controller
    {
        private readonly ApplicationDbContext _context;

        public OrderController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: /Order
        public async Task<IActionResult> Index(int page = 1)
        {
            const int pageSize = 10;
            var orders = await PaginatedList<Order>.CreateAsync(
                _context.Orders
                    .Include(o => o.Customer)
                    .AsNoTracking()
                    .OrderByDescending(o => o.OrderDate),
                page,
                pageSize);

            return View(orders);
        }

        // GET: /Order/Create
        public IActionResult Create()
        {
            ViewBag.CustomerId = new SelectList(_context.Customers, "Id", "FullName");
            return View();
        }

        // POST: /Order/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(Order model)
        {
            if (ModelState.IsValid)
            {
                if (model.OrderDate == default)
                {
                    model.OrderDate = DateTime.Now;
                }
                _context.Orders.Add(model);
                _context.SaveChanges();
                return RedirectToAction(nameof(Index));
            }
            ViewBag.CustomerId = new SelectList(_context.Customers, "Id", "FullName", model.CustomerId);
            return View(model);
        }

        // GET: /Order/Edit/5
        public IActionResult Edit(int id)
        {
            var order = _context.Orders.Find(id);
            if (order == null) return NotFound();

            ViewBag.CustomerId = new SelectList(_context.Customers, "Id", "FullName", order.CustomerId);
            return View(order);
        }

        // POST: /Order/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(int id, Order model)
        {
            if (id != model.Id) return NotFound();

            if (ModelState.IsValid)
            {
                _context.Orders.Update(model);
                _context.SaveChanges();
                return RedirectToAction(nameof(Index));
            }
            ViewBag.CustomerId = new SelectList(_context.Customers, "Id", "FullName", model.CustomerId);
            return View(model);
        }

        // POST: /Order/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Delete(int id)
        {
            var order = _context.Orders.Find(id);
            if (order == null) return NotFound();

            // Kiểm tra khóa ngoại từ OrderDetails
            var hasDetails = _context.OrderDetails.Any(od => od.OrderId == id);
            if (hasDetails)
            {
                TempData["ErrorMessage"] = $"Không thể xóa đơn hàng #{order.Id} vì có chứa chi tiết đơn hàng (sản phẩm).";
                return RedirectToAction(nameof(Index));
            }

            _context.Orders.Remove(order);
            _context.SaveChanges();
            TempData["SuccessMessage"] = $"Đã xóa đơn hàng #{order.Id}.";
            return RedirectToAction(nameof(Index));
        }
    }
}
