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
        public async Task<IActionResult> Index([FromQuery] CustomerFilterModel filter, int page = 1)
        {
            const int pageSize = 10;
            filter ??= new CustomerFilterModel();

            var query = _context.Customers.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var term = filter.Search.Trim().ToLower();
                query = query.Where(c => (c.FullName != null && c.FullName.ToLower().Contains(term)) || 
                                         (c.Phone != null && c.Phone.Contains(term)) || 
                                         (c.Email != null && c.Email.ToLower().Contains(term)));
            }

            var customers = await PaginatedList<Customer>.CreateAsync(
                query.OrderBy(c => c.FullName),
                page,
                pageSize);

            var viewModel = new CustomerIndexViewModel
            {
                Customers = customers,
                Filter = filter
            };

            return View(viewModel);
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

                // Không lưu mật khẩu gốc, chỉ lưu chuỗi đã hash vào database.
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
                    // Nếu không nhập mật khẩu mới thì giữ lại mật khẩu cũ.
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

            // Xóa mềm khách hàng để ẩn khỏi danh sách thường nhưng vẫn giữ lịch sử đơn hàng.
            _context.Customers.Remove(customer);
            _context.SaveChanges();
            TempData["SuccessMessage"] = $"Đã chuyển khách hàng '{customer.FullName}' vào thùng rác.";
            return RedirectToAction(nameof(Index));
        }

        // GET: /Customer/Trash
        public async Task<IActionResult> Trash(int page = 1)
        {
            const int pageSize = 10;
            var customers = await PaginatedList<Customer>.CreateAsync(
                _context.Customers
                    .IgnoreQueryFilters()
                    .Where(c => c.IsDeleted)
                    .AsNoTracking()
                    .OrderByDescending(c => c.DeletedAt),
                page,
                pageSize);

            return View(customers);
        }

        // POST: /Customer/Restore/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Restore(int id)
        {
            var customer = _context.Customers
                .IgnoreQueryFilters()
                .FirstOrDefault(c => c.Id == id && c.IsDeleted);

            if (customer == null) return NotFound();

            customer.IsDeleted = false;
            customer.DeletedAt = null;
            customer.UpdatedAt = DateTime.UtcNow;
            _context.SaveChanges();

            TempData["SuccessMessage"] = $"Đã khôi phục khách hàng '{customer.FullName}'.";
            return RedirectToAction(nameof(Trash));
        }
    }
}
