using CMS.Backend.Models;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    [Authorize]
    public class VoucherController : Controller
    {
        private readonly ApplicationDbContext _context;

        public VoucherController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index([FromQuery] VoucherFilterModel filter, int page = 1)
        {
            const int pageSize = 10;
            filter ??= new VoucherFilterModel();

            var query = _context.Vouchers.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var term = filter.Search.Trim().ToUpper();
                query = query.Where(v => v.Code.Contains(term));
            }

            var vouchers = await PaginatedList<Voucher>.CreateAsync(
                query.OrderByDescending(v => v.CreatedAt),
                page,
                pageSize);

            var viewModel = new VoucherIndexViewModel
            {
                Vouchers = vouchers,
                Filter = filter
            };

            return View(viewModel);
        }

        public IActionResult Create()
        {
            return View(new Voucher
            {
                IsActive = true,
                ExpiryDate = DateTime.Today.AddMonths(1)
            });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(Voucher model)
        {
            NormalizeVoucher(model);
            ValidateVoucher(model);

            if (!ModelState.IsValid) return View(model);

            _context.Vouchers.Add(model);
            _context.SaveChanges();
            TempData["SuccessMessage"] = $"Đã tạo voucher '{model.Code}'.";
            return RedirectToAction(nameof(Index));
        }

        public IActionResult Edit(int id)
        {
            var voucher = _context.Vouchers.Find(id);
            if (voucher == null) return NotFound();

            return View(voucher);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(int id, Voucher model)
        {
            if (id != model.Id) return NotFound();

            NormalizeVoucher(model);
            ValidateVoucher(model, id);

            if (!ModelState.IsValid) return View(model);

            _context.Vouchers.Update(model);
            _context.SaveChanges();
            TempData["SuccessMessage"] = $"Đã cập nhật voucher '{model.Code}'.";
            return RedirectToAction(nameof(Index));
        }

        public IActionResult Details(int id)
        {
            var voucher = _context.Vouchers
                .Include(v => v.CustomerVouchers)!
                    .ThenInclude(cv => cv.Customer)
                .AsNoTracking()
                .FirstOrDefault(v => v.Id == id);

            if (voucher == null) return NotFound();

            var assignedCustomerIds = voucher.CustomerVouchers?
                .Select(cv => cv.CustomerId)
                .ToList() ?? new List<int>();

            ViewBag.AvailableCustomers = new Microsoft.AspNetCore.Mvc.Rendering.SelectList(
                _context.Customers
                    .AsNoTracking()
                    .Where(c => !assignedCustomerIds.Contains(c.Id))
                    .OrderBy(c => c.FullName),
                "Id",
                "FullName");

            return View(voucher);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult AssignCustomer(int voucherId, int customerId)
        {
            var voucher = _context.Vouchers.Find(voucherId);
            var customerExists = _context.Customers.Any(c => c.Id == customerId);
            if (voucher == null || !customerExists) return NotFound();

            if (voucher.IsDeleted)
            {
                TempData["ErrorMessage"] = "Không thể gán khách hàng cho voucher đang ở thùng rác.";
                return RedirectToAction(nameof(Details), new { id = voucherId });
            }

            var exists = _context.CustomerVouchers.Any(cv =>
                cv.VoucherId == voucherId && cv.CustomerId == customerId);
            if (exists)
            {
                TempData["ErrorMessage"] = "Khách hàng này đã nhận voucher.";
                return RedirectToAction(nameof(Details), new { id = voucherId });
            }

            _context.CustomerVouchers.Add(new CustomerVoucher
            {
                VoucherId = voucherId,
                CustomerId = customerId,
                ClaimedAt = DateTime.UtcNow,
                IsUsed = false
            });
            _context.SaveChanges();
            TempData["SuccessMessage"] = "Đã gán voucher cho khách hàng.";
            return RedirectToAction(nameof(Details), new { id = voucherId });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult RemoveCustomer(int voucherId, int customerId)
        {
            var customerVoucher = _context.CustomerVouchers.FirstOrDefault(cv =>
                cv.VoucherId == voucherId && cv.CustomerId == customerId);
            if (customerVoucher == null) return NotFound();

            if (customerVoucher.IsUsed)
            {
                TempData["ErrorMessage"] = "Không thể bỏ gán voucher đã được sử dụng để giữ lịch sử.";
                return RedirectToAction(nameof(Details), new { id = voucherId });
            }

            _context.CustomerVouchers.Remove(customerVoucher);
            _context.SaveChanges();
            TempData["SuccessMessage"] = "Đã bỏ gán voucher khỏi khách hàng.";
            return RedirectToAction(nameof(Details), new { id = voucherId });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Delete(int id)
        {
            var voucher = _context.Vouchers.Find(id);
            if (voucher == null) return NotFound();

            _context.Vouchers.Remove(voucher);
            _context.SaveChanges();
            TempData["SuccessMessage"] = $"Đã chuyển voucher '{voucher.Code}' vào thùng rác.";
            return RedirectToAction(nameof(Index));
        }

        public async Task<IActionResult> Trash(int page = 1)
        {
            const int pageSize = 10;
            var vouchers = await PaginatedList<Voucher>.CreateAsync(
                _context.Vouchers
                    .IgnoreQueryFilters()
                    .Where(v => v.IsDeleted)
                    .AsNoTracking()
                    .OrderByDescending(v => v.DeletedAt),
                page,
                pageSize);

            return View(vouchers);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Restore(int id)
        {
            var voucher = _context.Vouchers
                .IgnoreQueryFilters()
                .FirstOrDefault(v => v.Id == id && v.IsDeleted);

            if (voucher == null) return NotFound();

            var hasCodeConflict = _context.Vouchers
                .Any(v => v.Id != voucher.Id && v.Code == voucher.Code);

            if (hasCodeConflict)
            {
                TempData["ErrorMessage"] = $"Không thể khôi phục voucher '{voucher.Code}' vì mã này đang được dùng. Vui lòng đổi/xử lý voucher đang active trước rồi khôi phục lại.";
                return RedirectToAction(nameof(Trash));
            }

            voucher.IsDeleted = false;
            voucher.DeletedAt = null;
            voucher.UpdatedAt = DateTime.UtcNow;
            _context.SaveChanges();

            TempData["SuccessMessage"] = $"Đã khôi phục voucher '{voucher.Code}'.";
            return RedirectToAction(nameof(Trash));
        }

        private void ValidateVoucher(Voucher model, int? currentId = null)
        {
            if (string.IsNullOrWhiteSpace(model.Code))
            {
                ModelState.AddModelError(nameof(Voucher.Code), "Vui lòng nhập mã voucher.");
            }

            if (model.DiscountValue < 0)
            {
                ModelState.AddModelError(nameof(Voucher.DiscountValue), "Giá trị giảm không được âm.");
            }

            if (model.MinimumOrderAmount < 0)
            {
                ModelState.AddModelError(nameof(Voucher.MinimumOrderAmount), "Đơn tối thiểu không được âm.");
            }

            var codeExists = _context.Vouchers
                .Any(v => v.Code == model.Code && (!currentId.HasValue || v.Id != currentId.Value));
            if (codeExists)
            {
                ModelState.AddModelError(nameof(Voucher.Code), "Mã voucher này đã tồn tại.");
            }
        }

        private static void NormalizeVoucher(Voucher model)
        {
            model.Code = (model.Code ?? string.Empty).Trim().ToUpperInvariant();
        }
    }
}
