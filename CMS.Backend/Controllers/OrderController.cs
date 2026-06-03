using CMS.Backend.Helpers;
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
        public async Task<IActionResult> Index([FromQuery] OrderFilterModel filter, int page = 1)
        {
            const int pageSize = 10;
            filter ??= new OrderFilterModel();

            var query = _context.Orders
                .Include(o => o.Customer)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var term = filter.Search.Trim().ToLower();
                query = query.Where(o => o.Customer != null && 
                    (o.Customer.FullName.ToLower().Contains(term) || 
                     (o.Customer.Phone != null && o.Customer.Phone.Contains(term)) || 
                     o.Id.ToString() == term));
            }

            if (filter.Status.HasValue)
            {
                query = query.Where(o => o.Status == filter.Status.Value);
            }

            if (filter.StartDate.HasValue)
            {
                query = query.Where(o => o.OrderDate >= filter.StartDate.Value);
            }

            if (filter.EndDate.HasValue)
            {
                var endOfDay = filter.EndDate.Value.Date.AddDays(1).AddTicks(-1);
                query = query.Where(o => o.OrderDate <= endOfDay);
            }

            var orders = await PaginatedList<Order>.CreateAsync(
                query.OrderByDescending(o => o.OrderDate),
                page,
                pageSize);

            var viewModel = new OrderIndexViewModel
            {
                Orders = orders,
                Filter = filter
            };

            return View(viewModel);
        }

        // GET: /Order/Details/5 — Xem chi tiết đơn hàng (read-only)
        public IActionResult Details(int id)
        {
            var order = _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.OrderDetailOptions)!
                        .ThenInclude(odo => odo.OptionValue)!
                            .ThenInclude(ov => ov!.OptionGroup)
                .AsNoTracking()
                .FirstOrDefault(o => o.Id == id);

            if (order == null) return NotFound();
            return View(order);
        }

        // GET: /Order/Create
        public IActionResult Create()
        {
            ViewBag.CustomerId = new SelectList(_context.Customers, "Id", "FullName");
            ViewBag.Products = _context.Products.OrderBy(p => p.Name).ToList();
            return View();
        }

        // POST: /Order/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(Order model, int[] ProductIds, int[] Quantities)
        {
            // Validate: phải có ít nhất 1 sản phẩm
            if (ProductIds == null || ProductIds.Length == 0 || ProductIds.All(id => id == 0))
            {
                ModelState.AddModelError("", "Vui lòng chọn ít nhất 1 sản phẩm cho đơn hàng.");
            }

            if (ModelState.IsValid)
            {
                if (model.OrderDate == default)
                {
                    model.OrderDate = DateTime.Now;
                }
                model.Status = OrderStatus.Pending;

                // Tạo chi tiết đơn hàng từ sản phẩm đã chọn
                var orderDetails = new List<OrderDetail>();
                decimal total = 0;
                for (int i = 0; ProductIds != null && i < ProductIds.Length; i++)
                {
                    if (ProductIds[i] == 0) continue;
                    int qty = (i < Quantities.Length && Quantities[i] > 0) ? Quantities[i] : 1;
                    var product = _context.Products.Find(ProductIds[i]);
                    if (product == null) continue;

                    var detail = new OrderDetail
                    {
                        ProductId = product.Id,
                        Quantity = qty,
                        UnitPrice = product.Price
                    };
                    orderDetails.Add(detail);
                    total += product.Price * qty;
                }

                if (!orderDetails.Any())
                {
                    ModelState.AddModelError("", "Không tìm thấy sản phẩm hợp lệ. Vui lòng chọn lại.");
                    ViewBag.CustomerId = new SelectList(_context.Customers, "Id", "FullName", model.CustomerId);
                    ViewBag.Products = _context.Products.OrderBy(p => p.Name).ToList();
                    return View(model);
                }

                model.TotalAmount = total;
                model.OrderDetails = orderDetails;
                _context.Orders.Add(model);
                _context.SaveChanges();

                TempData["SuccessMessage"] = $"Đã tạo đơn hàng #{model.Id} với {orderDetails.Count} sản phẩm.";
                return RedirectToAction(nameof(Index));
            }
            ViewBag.CustomerId = new SelectList(_context.Customers, "Id", "FullName", model.CustomerId);
            ViewBag.Products = _context.Products.OrderBy(p => p.Name).ToList();
            return View(model);
        }

        // GET: /Order/UpdateStatus/5 — Trang cập nhật trạng thái đơn hàng (chỉ sửa trạng thái + ghi chú)
        public IActionResult UpdateStatus(int id)
        {
            var order = _context.Orders
                .Include(o => o.Customer)
                .AsNoTracking()
                .FirstOrDefault(o => o.Id == id);

            if (order == null) return NotFound();
            ViewBag.NextStatuses = OrderStatusHelper.GetNextStatuses(order.Status);
            ViewBag.CanCancel = OrderStatusHelper.CanCancel(order.Status);
            return View("UpdateStatus", order);
        }

        // POST: /Order/UpdateStatus/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateStatus(int id, OrderStatus status, string? notes)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.OrderDetailOptions)
                .FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return NotFound();

            var oldStatus = order.Status;

            if (!OrderStatusHelper.CanTransition(oldStatus, status))
            {
                TempData["ErrorMessage"] = $"Không thể chuyển đơn hàng #{id} từ {OrderStatusHelper.GetDisplayName(oldStatus)} sang {OrderStatusHelper.GetDisplayName(status)}.";
                return RedirectToAction(nameof(UpdateStatus), new { id });
            }

            // 1. Nếu chuyển sang Confirmed (Duyệt đơn): kiểm tra kho và khấu trừ
            if (oldStatus == OrderStatus.Pending && status == OrderStatus.Confirmed)
            {
                // Kiểm tra kho
                foreach (var detail in order.OrderDetails)
                {
                    var product = await _context.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == detail.ProductId);
                    if (product == null) continue;

                    if (product.StockQuantity < detail.Quantity)
                    {
                        TempData["ErrorMessage"] = $"Không đủ tồn kho cho sản phẩm '{product.Name}'. Yêu cầu: {detail.Quantity}, hiện có: {product.StockQuantity}.";
                        return RedirectToAction(nameof(UpdateStatus), new { id });
                    }

                    if (detail.OrderDetailOptions != null)
                    {
                        foreach (var opt in detail.OrderDetailOptions)
                        {
                            var val = await _context.OptionValues.AsNoTracking().FirstOrDefaultAsync(o => o.Id == opt.OptionValueId);
                            if (val != null && val.StockQuantity.HasValue && val.StockQuantity.Value < detail.Quantity)
                            {
                                TempData["ErrorMessage"] = $"Không đủ tồn kho cho tùy chọn '{val.Name}' của sản phẩm '{product.Name}'. Yêu cầu: {detail.Quantity}, hiện có: {val.StockQuantity}.";
                                return RedirectToAction(nameof(UpdateStatus), new { id });
                            }
                        }
                    }
                }

                // Thực hiện trừ kho bọc trong transaction thủ công chống race condition
                await using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    foreach (var detail in order.OrderDetails)
                    {
                        // Trừ kho sản phẩm
                        await _context.Products
                            .Where(p => p.Id == detail.ProductId)
                            .ExecuteUpdateAsync(s => s.SetProperty(p => p.StockQuantity, p => p.StockQuantity - detail.Quantity));

                        // Trừ kho option (nếu có giới hạn tồn kho)
                        if (detail.OrderDetailOptions != null)
                        {
                            foreach (var opt in detail.OrderDetailOptions)
                            {
                                await _context.OptionValues
                                    .Where(o => o.Id == opt.OptionValueId && o.StockQuantity != null)
                                    .ExecuteUpdateAsync(s => s.SetProperty(o => o.StockQuantity, o => o.StockQuantity - detail.Quantity));
                            }
                        }
                    }
                    await transaction.CommitAsync();
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    TempData["ErrorMessage"] = $"Lỗi hệ thống khi trừ tồn kho: {ex.Message}";
                    return RedirectToAction(nameof(UpdateStatus), new { id });
                }
            }

            // 2. Nếu hủy đơn (Cancelled) và trạng thái cũ là đã xác nhận (đã bị trừ kho) -> Hoàn trả tồn kho
            if (status == OrderStatus.Cancelled && oldStatus != OrderStatus.Pending)
            {
                await using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    foreach (var detail in order.OrderDetails)
                    {
                        // Hoàn trả kho sản phẩm
                        await _context.Products
                            .Where(p => p.Id == detail.ProductId)
                            .ExecuteUpdateAsync(s => s.SetProperty(p => p.StockQuantity, p => p.StockQuantity + detail.Quantity));

                        // Hoàn trả kho option (nếu có giới hạn tồn kho)
                        if (detail.OrderDetailOptions != null)
                        {
                            foreach (var opt in detail.OrderDetailOptions)
                            {
                                await _context.OptionValues
                                    .Where(o => o.Id == opt.OptionValueId && o.StockQuantity != null)
                                    .ExecuteUpdateAsync(s => s.SetProperty(o => o.StockQuantity, o => o.StockQuantity + detail.Quantity));
                            }
                        }
                    }
                    await transaction.CommitAsync();
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    TempData["ErrorMessage"] = $"Lỗi hệ thống khi hoàn lại tồn kho: {ex.Message}";
                    return RedirectToAction(nameof(UpdateStatus), new { id });
                }
            }

            order.Status = status;
            order.Notes = notes;
            await _context.SaveChangesAsync();

            TempData["SuccessMessage"] = $"Đã cập nhật trạng thái đơn hàng #{id} → {OrderStatusHelper.GetDisplayName(status)}.";
            return RedirectToAction(nameof(Index));
        }

        // POST: /Order/AdvanceStatus/5 — Chuyển nhanh sang bước tiếp theo (1-click)
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AdvanceStatus(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.OrderDetailOptions)
                .FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return NotFound();

            var oldStatus = order.Status;

            var nextStatuses = OrderStatusHelper.GetNextStatuses(oldStatus)
                .Where(s => s != OrderStatus.Cancelled)
                .ToList();

            if (nextStatuses.Count == 0)
            {
                TempData["ErrorMessage"] = $"Đơn hàng #{id} đã ở trạng thái cuối, không thể chuyển tiếp.";
                return RedirectToAction(nameof(Index));
            }

            if (nextStatuses.Count > 1)
            {
                // Có nhiều lựa chọn → vào trang UpdateStatus để admin chọn
                return RedirectToAction(nameof(UpdateStatus), new { id });
            }

            // Chỉ 1 bước tiếp theo → chuyển luôn
            var nextStatus = nextStatuses[0];

            // Nếu chuyển từ Pending -> Confirmed: Kiểm tra kho và khấu trừ
            if (oldStatus == OrderStatus.Pending && nextStatus == OrderStatus.Confirmed)
            {
                // Kiểm tra kho
                foreach (var detail in order.OrderDetails)
                {
                    var product = await _context.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == detail.ProductId);
                    if (product == null) continue;

                    if (product.StockQuantity < detail.Quantity)
                    {
                        TempData["ErrorMessage"] = $"Không đủ tồn kho cho sản phẩm '{product.Name}'. Yêu cầu: {detail.Quantity}, hiện có: {product.StockQuantity}.";
                        return RedirectToAction(nameof(Index));
                    }

                    if (detail.OrderDetailOptions != null)
                    {
                        foreach (var opt in detail.OrderDetailOptions)
                        {
                            var val = await _context.OptionValues.AsNoTracking().FirstOrDefaultAsync(o => o.Id == opt.OptionValueId);
                            if (val != null && val.StockQuantity.HasValue && val.StockQuantity.Value < detail.Quantity)
                            {
                                TempData["ErrorMessage"] = $"Không đủ tồn kho cho tùy chọn '{val.Name}' của sản phẩm '{product.Name}'. Yêu cầu: {detail.Quantity}, hiện có: {val.StockQuantity}.";
                                return RedirectToAction(nameof(Index));
                            }
                        }
                    }
                }

                // Thực hiện trừ kho bọc trong transaction thủ công chống race condition
                await using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    foreach (var detail in order.OrderDetails)
                    {
                        // Trừ kho sản phẩm
                        await _context.Products
                            .Where(p => p.Id == detail.ProductId)
                            .ExecuteUpdateAsync(s => s.SetProperty(p => p.StockQuantity, p => p.StockQuantity - detail.Quantity));

                        // Trừ kho option (nếu có giới hạn tồn kho)
                        if (detail.OrderDetailOptions != null)
                        {
                            foreach (var opt in detail.OrderDetailOptions)
                            {
                                await _context.OptionValues
                                    .Where(o => o.Id == opt.OptionValueId && o.StockQuantity != null)
                                    .ExecuteUpdateAsync(s => s.SetProperty(o => o.StockQuantity, o => o.StockQuantity - detail.Quantity));
                            }
                        }
                    }
                    await transaction.CommitAsync();
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    TempData["ErrorMessage"] = $"Lỗi hệ thống khi trừ tồn kho: {ex.Message}";
                    return RedirectToAction(nameof(Index));
                }
            }

            order.Status = nextStatus;
            await _context.SaveChangesAsync();

            TempData["SuccessMessage"] = $"Đơn #{id}: {OrderStatusHelper.GetDisplayName(order.Status)} ✓";
            return RedirectToAction(nameof(Index));
        }

        // POST: /Order/Cancel/5 — Chỉ hủy khi đơn còn ở bước sớm.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Cancel(int id, string? cancellationReason)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.OrderDetailOptions)
                .FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return NotFound();

            var oldStatus = order.Status;

            if (!OrderStatusHelper.CanCancel(oldStatus))
            {
                TempData["ErrorMessage"] = $"Không thể hủy đơn hàng #{id} vì đơn đang ở trạng thái {OrderStatusHelper.GetDisplayName(oldStatus)}.";
                return RedirectToAction(nameof(Details), new { id });
            }

            if (string.IsNullOrWhiteSpace(cancellationReason))
            {
                TempData["ErrorMessage"] = "Vui lòng nhập lý do hủy đơn hàng.";
                return RedirectToAction(nameof(UpdateStatus), new { id });
            }

            // Hoàn tồn kho nếu đơn đã được xác nhận (khác Pending)
            if (oldStatus != OrderStatus.Pending)
            {
                await using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    foreach (var detail in order.OrderDetails)
                    {
                        // Hoàn trả kho sản phẩm
                        await _context.Products
                            .Where(p => p.Id == detail.ProductId)
                            .ExecuteUpdateAsync(s => s.SetProperty(p => p.StockQuantity, p => p.StockQuantity + detail.Quantity));

                        // Hoàn trả kho option (nếu có giới hạn tồn kho)
                        if (detail.OrderDetailOptions != null)
                        {
                            foreach (var opt in detail.OrderDetailOptions)
                            {
                                await _context.OptionValues
                                    .Where(o => o.Id == opt.OptionValueId && o.StockQuantity != null)
                                    .ExecuteUpdateAsync(s => s.SetProperty(o => o.StockQuantity, o => o.StockQuantity + detail.Quantity));
                            }
                        }
                    }
                    await transaction.CommitAsync();
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    TempData["ErrorMessage"] = $"Lỗi hệ thống khi hoàn lại tồn kho: {ex.Message}";
                    return RedirectToAction(nameof(Details), new { id });
                }
            }

            order.Status = OrderStatus.Cancelled;
            order.Notes = string.IsNullOrWhiteSpace(order.Notes)
                ? $"Hủy đơn: {cancellationReason.Trim()}"
                : $"{order.Notes}\nHủy đơn: {cancellationReason.Trim()}";

            await _context.SaveChangesAsync();

            TempData["SuccessMessage"] = $"Đã hủy đơn hàng #{id}.";
            return RedirectToAction(nameof(Details), new { id });
        }

        // POST: /Order/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Delete(int id)
        {
            var order = _context.Orders.Find(id);
            if (order == null) return NotFound();

            if (order.Status != OrderStatus.Pending)
            {
                TempData["ErrorMessage"] = $"Chỉ có thể xóa đơn hàng đang Chờ xác nhận. Đơn #{order.Id} hiện là {OrderStatusHelper.GetDisplayName(order.Status)}.";
                return RedirectToAction(nameof(Index));
            }

            _context.Orders.Remove(order);
            _context.SaveChanges();
            TempData["SuccessMessage"] = $"Đã chuyển đơn hàng #{order.Id} vào thùng rác.";
            return RedirectToAction(nameof(Index));
        }

        // GET: /Order/Trash — chỉ chứa đơn Pending đã xóa mềm.
        public async Task<IActionResult> Trash(int page = 1)
        {
            const int pageSize = 10;
            var orders = await PaginatedList<Order>.CreateAsync(
                _context.Orders
                    .IgnoreQueryFilters()
                    .Include(o => o.Customer)
                    .Where(o => o.IsDeleted && o.Status == OrderStatus.Pending)
                    .AsNoTracking()
                    .OrderByDescending(o => o.DeletedAt),
                page,
                pageSize);

            return View(orders);
        }

        // POST: /Order/Restore/5 — restore đơn Pending đã xóa mềm về danh sách chờ xác nhận.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Restore(int id)
        {
            var order = _context.Orders
                .IgnoreQueryFilters()
                .FirstOrDefault(o => o.Id == id && o.IsDeleted && o.Status == OrderStatus.Pending);

            if (order == null) return NotFound();

            order.IsDeleted = false;
            order.DeletedAt = null;
            order.UpdatedAt = DateTime.UtcNow;
            _context.SaveChanges();

            TempData["SuccessMessage"] = $"Đã khôi phục đơn hàng #{order.Id} về trạng thái Chờ xác nhận.";
            return RedirectToAction(nameof(Trash));
        }
    }
}
