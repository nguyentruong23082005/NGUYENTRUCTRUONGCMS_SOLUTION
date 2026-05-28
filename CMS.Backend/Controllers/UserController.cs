using CMS.Backend.Models;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    [Authorize(Roles = "Admin")] // Buổi 5: Chỉ Admin mới quản lý được thành viên
    public class UserController : Controller
    {
        private readonly ApplicationDbContext _context;

        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: /User
        public async Task<IActionResult> Index(int page = 1)
        {
            const int pageSize = 10;
            var users = await PaginatedList<User>.CreateAsync(
                _context.Users
                    .AsNoTracking()
                    .OrderBy(u => u.Id),
                page,
                pageSize);
            return View(users);
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

                // Nếu nhập mật khẩu mới thì đổi, nếu để trống thì giữ mật khẩu cũ
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
    }
}
