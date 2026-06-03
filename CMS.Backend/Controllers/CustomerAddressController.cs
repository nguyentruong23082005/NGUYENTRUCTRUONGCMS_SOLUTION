using CMS.Backend.Models;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    [Authorize]
    public class CustomerAddressController : Controller
    {
        private readonly ApplicationDbContext _context;

        public CustomerAddressController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index(int page = 1)
        {
            const int pageSize = 10;
            var addresses = await PaginatedList<CustomerAddress>.CreateAsync(
                _context.CustomerAddresses
                    .Include(a => a.Customer)
                    .AsNoTracking()
                    .OrderBy(a => a.Customer!.FullName)
                    .ThenByDescending(a => a.IsDefault),
                page,
                pageSize);

            return View(addresses);
        }

        public IActionResult Create()
        {
            PopulateCustomers();
            return View(new CustomerAddress());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(CustomerAddress model)
        {
            ValidateCustomerAddress(model);
            if (!ModelState.IsValid)
            {
                PopulateCustomers(model.CustomerId);
                return View(model);
            }

            ApplyDefaultAddressRule(model);
            _context.CustomerAddresses.Add(model);
            _context.SaveChanges();
            TempData["SuccessMessage"] = $"Đã tạo địa chỉ cho '{model.ReceiverName}'.";
            return RedirectToAction(nameof(Index));
        }

        public IActionResult Edit(int id)
        {
            var address = _context.CustomerAddresses.Find(id);
            if (address == null) return NotFound();

            PopulateCustomers(address.CustomerId);
            return View(address);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(int id, CustomerAddress model)
        {
            if (id != model.Id) return NotFound();

            ValidateCustomerAddress(model);
            if (!ModelState.IsValid)
            {
                PopulateCustomers(model.CustomerId);
                return View(model);
            }

            ApplyDefaultAddressRule(model, model.Id);
            _context.CustomerAddresses.Update(model);
            _context.SaveChanges();
            TempData["SuccessMessage"] = $"Đã cập nhật địa chỉ cho '{model.ReceiverName}'.";
            return RedirectToAction(nameof(Index));
        }

        public IActionResult Details(int id)
        {
            var address = _context.CustomerAddresses
                .Include(a => a.Customer)
                .AsNoTracking()
                .FirstOrDefault(a => a.Id == id);

            if (address == null) return NotFound();
            return View(address);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Delete(int id)
        {
            var address = _context.CustomerAddresses.Find(id);
            if (address == null) return NotFound();

            _context.CustomerAddresses.Remove(address);
            _context.SaveChanges();
            TempData["SuccessMessage"] = $"Đã chuyển địa chỉ #{address.Id} vào thùng rác.";
            return RedirectToAction(nameof(Index));
        }

        public async Task<IActionResult> Trash(int page = 1)
        {
            const int pageSize = 10;
            var addresses = await PaginatedList<CustomerAddress>.CreateAsync(
                _context.CustomerAddresses
                    .IgnoreQueryFilters()
                    .Include(a => a.Customer)
                    .Where(a => a.IsDeleted)
                    .AsNoTracking()
                    .OrderByDescending(a => a.DeletedAt),
                page,
                pageSize);

            return View(addresses);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Restore(int id)
        {
            var address = _context.CustomerAddresses
                .IgnoreQueryFilters()
                .FirstOrDefault(a => a.Id == id && a.IsDeleted);

            if (address == null) return NotFound();

            address.IsDeleted = false;
            address.DeletedAt = null;
            address.UpdatedAt = DateTime.UtcNow;
            if (address.IsDefault)
            {
                ApplyDefaultAddressRule(address, address.Id);
            }

            _context.SaveChanges();
            TempData["SuccessMessage"] = $"Đã khôi phục địa chỉ #{address.Id}.";
            return RedirectToAction(nameof(Trash));
        }

        private void PopulateCustomers(int? selectedId = null)
        {
            ViewBag.Customers = new SelectList(
                _context.Customers.AsNoTracking().OrderBy(c => c.FullName),
                "Id",
                "FullName",
                selectedId);
        }

        private void ValidateCustomerAddress(CustomerAddress model)
        {
            if (model.CustomerId <= 0)
            {
                ModelState.AddModelError(nameof(CustomerAddress.CustomerId), "Vui lòng chọn khách hàng.");
            }

            if (string.IsNullOrWhiteSpace(model.ReceiverName))
                ModelState.AddModelError(nameof(CustomerAddress.ReceiverName), "Vui lòng nhập tên người nhận.");

            if (string.IsNullOrWhiteSpace(model.ReceiverPhone))
                ModelState.AddModelError(nameof(CustomerAddress.ReceiverPhone), "Vui lòng nhập số điện thoại.");

            if (string.IsNullOrWhiteSpace(model.AddressLine))
                ModelState.AddModelError(nameof(CustomerAddress.AddressLine), "Vui lòng nhập địa chỉ.");

            if (string.IsNullOrWhiteSpace(model.Province))
                ModelState.AddModelError(nameof(CustomerAddress.Province), "Vui lòng nhập tỉnh/thành.");

            if (string.IsNullOrWhiteSpace(model.District))
                ModelState.AddModelError(nameof(CustomerAddress.District), "Vui lòng nhập quận/huyện.");

            if (string.IsNullOrWhiteSpace(model.Ward))
                ModelState.AddModelError(nameof(CustomerAddress.Ward), "Vui lòng nhập phường/xã.");
        }

        private void ApplyDefaultAddressRule(CustomerAddress model, int? excludeId = null)
        {
            if (!model.IsDefault) return;

            var otherDefaults = _context.CustomerAddresses
                .Where(a => a.CustomerId == model.CustomerId && a.IsDefault);

            if (excludeId.HasValue)
            {
                otherDefaults = otherDefaults.Where(a => a.Id != excludeId.Value);
            }

            foreach (var address in otherDefaults)
            {
                address.IsDefault = false;
                address.UpdatedAt = DateTime.UtcNow;
            }
        }
    }
}
