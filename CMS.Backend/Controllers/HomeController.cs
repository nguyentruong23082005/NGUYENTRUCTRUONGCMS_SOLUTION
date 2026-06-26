using CMS.Backend.Models;
using CMS.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace CMS.Backend.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ApplicationDbContext _context;

        public HomeController(ILogger<HomeController> logger, ApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public IActionResult Index()
        {
            // Lấy 3 bài viết mới nhất kèm tên danh mục
            var latestPosts = _context.Posts
                .Include(p => p.PostCategory)
                .AsNoTracking()
                .OrderByDescending(p => p.CreatedAt)
                .Take(3)
                .ToList();

            return View(latestPosts);
        }

        public IActionResult Dashboard()
        {
            // Các số liệu tổng quan để hiển thị trên trang Dashboard quản trị.
            ViewBag.PostCount = _context.Posts.Count();
            ViewBag.CategoryCount = _context.PostCategories.Count();
            ViewBag.UserCount = _context.Users.Count();
            ViewBag.ProductCount = _context.Products.Count();
            ViewBag.CustomerCount = _context.Customers.Count();
            ViewBag.OrderCount = _context.Orders.Count();
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [HttpGet("/home/seed-best-sellers")]
        public async Task<IActionResult> SeedBestSellers()
        {
            try
            {
                // IDs of the 5 target products
                var productIds = new[] { 2, 3, 4, 8, 6 };
                var products = await _context.Products
                    .Where(p => productIds.Contains(p.Id))
                    .ToListAsync();

                // Set specific TotalSold counts to rank them in the exact order as the photo:
                // 1. Trà Sữa Phúc Long (L) - ID 2: 150 sold
                // 2. Trà Sữa Ô Long (L) - ID 3: 140 sold
                // 3. Hồng Trà Sữa (L) - ID 4: 130 sold
                // 4. Trà Sữa Lài (M) - ID 8: 120 sold
                // 5. Trà Sữa Matcha (L) - ID 6: 110 sold
                foreach (var p in products)
                {
                    if (p.Id == 2) p.TotalSold = 150;
                    else if (p.Id == 3) p.TotalSold = 140;
                    else if (p.Id == 4) p.TotalSold = 130;
                    else if (p.Id == 8) p.TotalSold = 120;
                    else if (p.Id == 6) p.TotalSold = 110;
                }

                // Create a real completed order containing these 5 products
                var customer = await _context.Customers.FirstOrDefaultAsync();
                if (customer != null)
                {
                    // Check if test order already exists to avoid duplicates
                    var existingOrder = await _context.Orders.FirstOrDefaultAsync(o => o.Notes == "Đơn hàng tự động test Bestseller");
                    if (existingOrder == null)
                    {
                        var order = new CMS.Data.Entities.Order
                        {
                            CustomerId = customer.Id,
                            ReceiverName = customer.FullName ?? "Bestseller Tester",
                            ReceiverPhone = customer.Phone ?? "0123456789",
                            ShippingAddress = "20 Tăng Nhơn Phú, Phước Long B, Quận 9, TP. HCM",
                            TotalAmount = products.Sum(p => p.Price),
                            Status = CMS.Data.Entities.OrderStatus.Completed,
                            Notes = "Đơn hàng tự động test Bestseller",
                            OrderDate = DateTime.UtcNow
                        };

                        _context.Orders.Add(order);
                        await _context.SaveChangesAsync(); // Save to get order.Id

                        foreach (var p in products)
                        {
                            var orderDetail = new CMS.Data.Entities.OrderDetail
                            {
                                OrderId = order.Id,
                                ProductId = p.Id,
                                Quantity = 1,
                                UnitPrice = p.Price
                            };
                            _context.OrderDetails.Add(orderDetail);
                        }
                    }
                }

                await _context.SaveChangesAsync();
                return Ok("Success: 5 bestseller products updated and test order created successfully!");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}

