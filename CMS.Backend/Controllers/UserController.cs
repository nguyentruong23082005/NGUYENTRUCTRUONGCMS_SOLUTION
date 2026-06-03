using CMS.Backend.Models;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    [Authorize(Roles = "Admin")] // Chỉ Admin mới quản lý được tài khoản nhân viên.
    public class UserController : Controller
    {
        private readonly ApplicationDbContext _context;

        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: /User
        public async Task<IActionResult> Index(UserFilterModel filter, int page = 1)
        {
            const int pageSize = 10;
            var query = _context.Users.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var searchTerm = filter.Search.Trim().ToLower();
                query = query.Where(u => 
                    u.Username.ToLower().Contains(searchTerm) || 
                    (u.FullName != null && u.FullName.ToLower().Contains(searchTerm)) ||
                    (u.Role != null && u.Role.ToLower().Contains(searchTerm))
                );
            }

            var paginatedUsers = await PaginatedList<User>.CreateAsync(
                query.OrderBy(u => u.Id),
                page,
                pageSize);

            var viewModel = new UserIndexViewModel
            {
                Users = paginatedUsers,
                Filter = filter
            };

            return View(viewModel);
        }

        // GET: /User/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: /User/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(User model)
        {
            // Kiểm tra tên đăng nhập đã tồn tại chưa
            var exists = _context.Users.Any(u => u.Username == model.Username);
            if (exists)
            {
                ModelState.AddModelError("Username", "Tên đăng nhập này đã có người dùng!");
            }

            if (ModelState.IsValid)
            {
                var passwordHasher = new PasswordHasher<User>();
                // Lưu mật khẩu dạng hash, không lưu mật khẩu gốc.
                model.PasswordHash = passwordHasher.HashPassword(model, model.PasswordHash ?? "");

                _context.Users.Add(model);
                _context.SaveChanges();
                return RedirectToAction(nameof(Index));
            }

            return View(model);
        }

        // GET: /User/Edit/5
        public IActionResult Edit(int id)
        {
            var user = _context.Users.Find(id);
            if (user == null) return NotFound();
            return View(user);
        }

        // POST: /User/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(int id, User model, string? newPassword)
        {
            if (id != model.Id) return NotFound();

            var user = _context.Users.Find(id);
            if (user == null) return NotFound();

            if (ModelState.IsValid)
            {
                user.FullName = model.FullName;
                user.Role = model.Role;

                // Chỉ đổi mật khẩu khi admin nhập mật khẩu mới; để trống thì giữ nguyên.
                if (!string.IsNullOrWhiteSpace(newPassword))
                {
                    var passwordHasher = new PasswordHasher<User>();
                    user.PasswordHash = passwordHasher.HashPassword(user, newPassword);
                }

                _context.SaveChanges();
                return RedirectToAction(nameof(Index));
            }

            return View(model);
        }

        // POST: /User/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Delete(int id)
        {
            var user = _context.Users.Find(id);
            if (user != null)
            {
                _context.Users.Remove(user);
                _context.SaveChanges();
            }
            return RedirectToAction(nameof(Index));
        }

        // GET: /User/Trash
        public async Task<IActionResult> Trash(int page = 1)
        {
            const int pageSize = 10;
            var users = await PaginatedList<User>.CreateAsync(
                _context.Users
                    .IgnoreQueryFilters()
                    .Where(u => u.IsDeleted)
                    .AsNoTracking()
                    .OrderByDescending(u => u.DeletedAt),
                page,
                pageSize);

            return View(users);
        }

        // POST: /User/Restore/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Restore(int id)
        {
            var user = _context.Users
                .IgnoreQueryFilters()
                .FirstOrDefault(u => u.Id == id && u.IsDeleted);

            if (user == null) return NotFound();

            user.IsDeleted = false;
            user.DeletedAt = null;
            user.UpdatedAt = DateTime.UtcNow;
            _context.SaveChanges();

            TempData["SuccessMessage"] = $"Đã khôi phục thành viên '{user.FullName}'.";
            return RedirectToAction(nameof(Trash));
        }
    }
}
