using CMS.Backend.Models;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        // GET: /OrderDetail — Xem toàn bộ chi tiết đơn hàng (chỉ đọc, không thêm/sửa)
        // Lưu ý: Nên xem chi tiết qua /Order/Details/{id} thay vì trang này.
        public async Task<IActionResult> Index(int page = 1)
        {
            const int pageSize = 10;
            var orderDetails = await PaginatedList<OrderDetail>.CreateAsync(
                _context.OrderDetails
                    // Include để View hiển thị được thông tin đơn hàng và sản phẩm.
                    .Include(od => od.Order)
                    .Include(od => od.Product)
                    .AsNoTracking()
                    .OrderByDescending(od => od.OrderId),
                page,
                pageSize);

            return View(orderDetails);
        }

    }
}
