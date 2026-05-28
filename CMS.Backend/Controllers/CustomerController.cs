using CMS.Backend.Models;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    [Authorize]
    public class CustomerController : Controller
    {
        private readonly ApplicationDbContext _context;

        public CustomerController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: /Customer
        public async Task<IActionResult> Index(int page = 1)
        {
            const int pageSize = 10;
            var customers = await PaginatedList<Customer>.CreateAsync(
                _context.Customers
                    .AsNoTracking()
                    .OrderBy(c => c.FullName),
                page,
                pageSize);

            return View(customers);
        }

        // GET: /Customer/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: /Customer/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(Customer model)
        {
            if (string.IsNullOrWhiteSpace(model.Password))
            {
                ModelState.AddModelError("Password", "Vui lòng nhập mật khẩu.");
            }

            if (ModelState.IsValid)
            {
                // Kiểm tra email trùng
                if (_context.Customers.Any(c => c.Email == model.Email))
                {
                    ModelState.AddModelError("Email", "Email này đã được sử dụng.");
                    return View(model);
                }

                var passwordHasher = new Microsoft.AspNetCore.Identity.PasswordHasher<Customer>();
                var password = model.Password!;
                model.Password = passwordHasher.HashPassword(model, password);

                _context.Customers.Add(model);
                _context.SaveChanges();
                return RedirectToAction(nameof(Index));
            }
            return View(model);
        }

        // GET: /Customer/Edit/5
        public IActionResult Edit(int id)
        {
            var customer = _context.Customers.Find(id);
            if (customer == null) return NotFound();
            return View(customer);
        }

        // POST: /Customer/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(int id, Customer model)
        {
            if (id != model.Id) return NotFound();

            if (ModelState.IsValid)
            {
                // Kiểm tra email trùng nhưng bỏ qua chính khách hàng này
                if (_context.Customers.Any(c => c.Email == model.Email && c.Id != id))
                {
                    ModelState.AddModelError("Email", "Email này đã được sử dụng bởi khách hàng khác.");
                    return View(model);
                }

                var existingCustomer = _context.Customers.AsNoTracking().FirstOrDefault(c => c.Id == id);
                if (existingCustomer == null) return NotFound();

                if (string.IsNullOrWhiteSpace(model.Password))
                {
                    model.Password = existingCustomer.Password;
                }
                else
                {
                    var passwordHasher = new Microsoft.AspNetCore.Identity.PasswordHasher<Customer>();
                    model.Password = passwordHasher.HashPassword(model, model.Password);
                }

                _context.Customers.Update(model);
                _context.SaveChanges();
                return RedirectToAction(nameof(Index));
            }
            return View(model);
        }

        // POST: /Customer/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Delete(int id)
        {
            var customer = _context.Customers.Find(id);
            if (customer == null) return NotFound();

            // Kiểm tra khóa ngoại từ Orders
            var hasOrders = _context.Orders.Any(o => o.CustomerId == id);
            if (hasOrders)
            {
                TempData["ErrorMessage"] = $"Không thể xóa khách hàng '{customer.FullName}' vì đã có đơn hàng.";
                return RedirectToAction(nameof(Index));
            }

            _context.Customers.Remove(customer);
            _context.SaveChanges();
            TempData["SuccessMessage"] = $"Đã xóa khách hàng '{customer.FullName}'.";
            return RedirectToAction(nameof(Index));
        }
    }
}
