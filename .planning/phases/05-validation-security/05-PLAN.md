# Phase 5: Bảo mật & Phân quyền (Security & Identity)

**Mục tiêu:** Xây dựng chức năng Đăng nhập (Login), Đăng xuất (Logout), và phân quyền truy cập (Authorization) cho toàn bộ trang Admin theo đúng nội dung Buổi 5 trong tài liệu thầy Nguyễn Cao Thái.

**Requirements:** REQ-SEC-01, REQ-SEC-02, REQ-SEC-03

---

## Sơ đồ luồng hoạt động (Theo tài liệu Buổi 5)

```
Người dùng --> Trang Login --> Kiểm tra DB (Users table)
  --> Khớp --> Tạo Cookie --> Vào trang Admin
  --> Không khớp --> Báo lỗi, quay lại Login
```

---

## Kế hoạch thực hiện

### Nhiệm vụ 1: Cấu hình Cookie Authentication trong Program.cs
**File cần sửa:** `CMS.Backend/Program.cs`

Hiện tại `Program.cs` chỉ có `app.UseAuthorization()`. Cần thêm dịch vụ Cookie Authentication VÀ thêm `app.UseAuthentication()` trước `app.UseAuthorization()`.

**Code cần thêm (trước dòng `var app = builder.Build()`):**
```csharp
using Microsoft.AspNetCore.Authentication.Cookies;

// Khai báo dịch vụ xác thực Cookie
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Account/Login";
        options.AccessDeniedPath = "/Account/AccessDenied";
    });
```

**Code cần thêm (sau `app.UseRouting()`, TRƯỚC `app.UseAuthorization()`):**
```csharp
app.UseAuthentication(); // Xác nhận "Anh là ai?"
app.UseAuthorization();  // Xác nhận "Anh được làm gì?"
```

**Kiểm tra:** Build thành công, không lỗi cú pháp.

---

### Nhiệm vụ 2: Tạo AccountController.cs
**File cần tạo mới:** `CMS.Backend/Controllers/AccountController.cs`

Controller này xử lý 3 chức năng: hiện trang Login (GET), xử lý Login (POST), và Logout.

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;
using CMS.Data;

namespace CMS.Backend.Controllers
{
    public class AccountController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AccountController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Login(string username, string password)
        {
            var user = _context.Users.FirstOrDefault(u =>
                u.Username == username && u.PasswordHash == password);

            if (user != null)
            {
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role),
                    new Claim("FullName", user.FullName)
                };
                var claimsIdentity = new ClaimsIdentity(
                    claims, CookieAuthenticationDefaults.AuthenticationScheme);
                await HttpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    new ClaimsPrincipal(claimsIdentity));
                return RedirectToAction("Index", "Home");
            }

            ViewBag.Error = "Tên đăng nhập hoặc mật khẩu không đúng!";
            return View();
        }

        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction("Login");
        }

        [HttpGet]
        public IActionResult AccessDenied()
        {
            return View();
        }
    }
}
```

---

### Nhiệm vụ 3: Tạo giao diện trang Đăng nhập
**File cần tạo mới:** `CMS.Backend/Views/Account/Login.cshtml`
**Thư mục cần tạo:** `CMS.Backend/Views/Account/`

Trang này dùng Layout = null (độc lập, không dùng sidebar admin):

```html
@{
    Layout = null;
}
<!DOCTYPE html>
<html>
<head>
    <title>Đăng nhập hệ thống</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
</head>
<body class="bg-light">
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-4">
                <div class="card shadow border-0">
                    <div class="card-header bg-primary text-white text-center py-3">
                        <h5 class="mb-0">HỆ THỐNG QUẢN TRỊ CMS</h5>
                    </div>
                    <div class="card-body p-4">
                        <form asp-action="Login" method="post">
                            <div class="mb-3">
                                <label class="form-label">Tên đăng nhập</label>
                                <input type="text" name="username" class="form-control" required />
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Mật khẩu</label>
                                <input type="password" name="password" class="form-control" required />
                            </div>
                            @if (ViewBag.Error != null) {
                                <div class="alert alert-danger py-2">@ViewBag.Error</div>
                            }
                            <button type="submit" class="btn btn-primary w-100">ĐĂNG NHẬP</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
```

---

### Nhiệm vụ 4: Tạo trang Access Denied
**File cần tạo mới:** `CMS.Backend/Views/Account/AccessDenied.cshtml`

```html
@{
    Layout = "_LayoutAdmin";
}
<div class="container mt-5 text-center">
    <h1 class="text-danger">403 - KHÔNG CÓ QUYỀN TRUY CẬP</h1>
    <p>Bạn không có đủ quyền hạn để xem trang này. Vui lòng liên hệ quản trị viên.</p>
    <a href="/" class="btn btn-primary">Quay lại trang chủ</a>
</div>
```

---

### Nhiệm vụ 5: Bảo vệ các trang Admin bằng [Authorize]
**Files cần sửa:**
- `CMS.Backend/Controllers/CategoryController.cs` → Thêm `[Authorize]`
- `CMS.Backend/Controllers/PostController.cs` → Thêm `[Authorize]`
- `CMS.Backend/Controllers/ProductController.cs` → Thêm `[Authorize]`
- `CMS.Backend/Controllers/CustomerController.cs` → Thêm `[Authorize]`
- `CMS.Backend/Controllers/OrderController.cs` → Thêm `[Authorize]`
- `CMS.Backend/Controllers/OrderDetailController.cs` → Thêm `[Authorize]`
- `CMS.Backend/Controllers/ProductCategoryController.cs` → Thêm `[Authorize]`
- `CMS.Backend/Controllers/UserController.cs` → Thêm `[Authorize(Roles = "Admin")]` (chỉ Admin mới được quản lý thành viên)

**Cú pháp:**
```csharp
using Microsoft.AspNetCore.Authorization;

[Authorize]
public class CategoryController : Controller { ... }

// UserController dùng phân quyền theo Role:
[Authorize(Roles = "Admin")]
public class UserController : Controller { ... }
```

---

### Nhiệm vụ 6: Hiển thị thông tin người dùng + nút Đăng xuất trên Layout Admin
**File cần sửa:** `CMS.Backend/Views/Shared/_LayoutAdmin.cshtml`

Thêm đoạn code hiển thị tên người dùng đang đăng nhập và nút Logout vào phần header/sidebar của layout:

```html
<div class="p-2 border-top border-secondary mt-auto">
    @if (User.Identity.IsAuthenticated)
    {
        <span class="text-muted small d-block">
            Chào, <strong>@User.FindFirst("FullName")?.Value</strong>
            (@User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value)
        </span>
        <a class="btn btn-outline-danger btn-sm mt-1 w-100"
           asp-controller="Account" asp-action="Logout">Đăng xuất</a>
    }
</div>
```

---

## Tiêu chí kiểm tra (Acceptance Criteria)

- [ ] **Test 1 - Chưa đăng nhập:** Mở trình duyệt ẩn danh, gõ `/Category`. Hệ thống phải tự động chuyển về `/Account/Login`.
- [ ] **Test 2 - Đăng nhập sai:** Nhập sai Username/Password, trang Login hiện thông báo lỗi đỏ.
- [ ] **Test 3 - Đăng nhập đúng (Admin):** Nhập đúng tài khoản Admin, hệ thống chuyển vào `/Home/Index`. Vào được tất cả trang kể cả `/User`.
- [ ] **Test 4 - Đăng nhập đúng (Editor):** Vào được `/Category`, `/Post` nhưng khi vào `/User` hệ thống phải chuyển về `/Account/AccessDenied`.
- [ ] **Test 5 - Đăng xuất:** Nhấn nút Đăng xuất, hệ thống xóa Cookie và quay về trang Login.
- [ ] **Test 6 - Kiểm tra Cookie:** Nhấn F12 → Tab Application → Cookies → Phải thấy `.AspNetCore.Cookies`.

---

## Lưu ý quan trọng

> **Mật khẩu:** Theo tài liệu Buổi 5, chúng ta lưu mật khẩu dạng thô (Plain Text) để dễ học. Dữ liệu trong bảng `Users` cần có ít nhất 1 tài khoản `Admin` và 1 tài khoản `Editor` để test.
>
> **Thứ tự `UseAuthentication` / `UseAuthorization`:** Bắt buộc phải có `UseAuthentication()` trước `UseAuthorization()` trong `Program.cs`, nếu không hệ thống sẽ không nhận ra người dùng đã đăng nhập.
