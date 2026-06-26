using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;

namespace CMS.Backend.Controllers
{
    public class AccountController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AccountController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: /Account/Login
        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        // POST: /Account/Login — Kiểm tra thông tin và cấp Cookie
        [HttpPost]
        [ValidateAntiForgeryToken]
        [EnableRateLimiting("AuthPolicy")]
        public async Task<IActionResult> Login(string username, string password)
        {
            // Bước 1: Kiểm tra tài khoản trong bảng Users
            var user = _context.Users.FirstOrDefault(u => u.Username == username);

            if (user != null)
            {
                bool isPasswordValid = false;
                var passwordHasher = new PasswordHasher<User>();

                try
                {
                    // VerifyHashedPassword dùng cho mật khẩu đã hash bằng PasswordHasher.
                    var verificationResult = passwordHasher.VerifyHashedPassword(user, user.PasswordHash ?? "", password ?? "");
                    if (verificationResult == PasswordVerificationResult.Success || verificationResult == PasswordVerificationResult.SuccessRehashNeeded)
                    {
                        isPasswordValid = true;
                    }
                }
                catch (FormatException)
                {
                    // Hỗ trợ dữ liệu cũ: nếu DB còn mật khẩu plain text thì đăng nhập xong sẽ hash lại.
                    if (user.PasswordHash == password)
                    {
                        user.PasswordHash = passwordHasher.HashPassword(user, password);
                        _context.SaveChanges();
                        isPasswordValid = true;
                    }
                }

                if (isPasswordValid)
                {
                    // Bước 2: Thiết lập danh tính (Claims) — "Thẻ bài" của người dùng
                    var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role), // Admin hoặc Editor
                    new Claim("FullName", user.FullName)
                };

                    var claimsIdentity = new ClaimsIdentity(
                        claims, CookieAuthenticationDefaults.AuthenticationScheme);

                    // SignInAsync tạo cookie đăng nhập để các controller [Authorize] nhận ra người dùng.
                    await HttpContext.SignInAsync(
                        CookieAuthenticationDefaults.AuthenticationScheme,
                        new ClaimsPrincipal(claimsIdentity));

                    return RedirectToAction("Dashboard", "Home");
                }
            }

            // Đăng nhập thất bại — hiện thông báo lỗi
            ViewBag.Error = "Tên đăng nhập hoặc mật khẩu không đúng!";
            return View();
        }

        // GET: /Account/Logout — Xóa Cookie và quay về Login
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction("Login");
        }

        // GET: /Account/AccessDenied — Trang thông báo không có quyền
        [HttpGet]
        public IActionResult AccessDenied()
        {
            return View();
        }
    }
}
