using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace CMS.Backend.Controllers
{
    [Authorize]
    public class OrderDetailController : Controller
    {
        private readonly ApplicationDbContext _context;

        public OrderDetailController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: /OrderDetail
        public IActionResult Index()
        {
            var orderDetails = _context.OrderDetails
                .Include(od => od.Order)
                .Include(od => od.Product)
                .OrderByDescending(od => od.OrderId)
                .ToList();

            return View(orderDetails);
        }

        // GET: /OrderDetail/Create
        public IActionResult Create()
        {
            ViewBag.OrderId = new SelectList(_context.Orders, "Id", "Id");
            ViewBag.ProductId = new SelectList(_context.Products, "Id", "Name");
            return View();
        }

        // POST: /OrderDetail/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(OrderDetail model)
        {
            if (ModelState.IsValid)
            {
                _context.OrderDetails.Add(model);
                _context.SaveChanges();
                return RedirectToAction(nameof(Index));
            }
            ViewBag.OrderId = new SelectList(_context.Orders, "Id", "Id", model.OrderId);
            ViewBag.ProductId = new SelectList(_context.Products, "Id", "Name", model.ProductId);
            return View(model);
        }

        // GET: /OrderDetail/Edit/5
        public IActionResult Edit(int id)
        {
            var orderDetail = _context.OrderDetails.Find(id);
            if (orderDetail == null) return NotFound();

            ViewBag.OrderId = new SelectList(_context.Orders, "Id", "Id", orderDetail.OrderId);
            ViewBag.ProductId = new SelectList(_context.Products, "Id", "Name", orderDetail.ProductId);
            return View(orderDetail);
        }

        // POST: /OrderDetail/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(int id, OrderDetail model)
        {
            if (id != model.Id) return NotFound();

            if (ModelState.IsValid)
            {
                _context.OrderDetails.Update(model);
                _context.SaveChanges();
                return RedirectToAction(nameof(Index));
            }
            ViewBag.OrderId = new SelectList(_context.Orders, "Id", "Id", model.OrderId);
            ViewBag.ProductId = new SelectList(_context.Products, "Id", "Name", model.ProductId);
            return View(model);
        }

        // POST: /OrderDetail/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Delete(int id)
        {
            var orderDetail = _context.OrderDetails.Find(id);
            if (orderDetail == null) return NotFound();

            _context.OrderDetails.Remove(orderDetail);
            _context.SaveChanges();
            TempData["SuccessMessage"] = "Đã xóa chi tiết đơn hàng.";
            return RedirectToAction(nameof(Index));
        }
    }
}
