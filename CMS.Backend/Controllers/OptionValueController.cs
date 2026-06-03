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
    public class OptionValueController : Controller
    {
        private readonly ApplicationDbContext _context;

        public OptionValueController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index([FromQuery] OptionValueFilterModel filter, int page = 1)
        {
            const int pageSize = 10;
            filter ??= new OptionValueFilterModel();

            var query = _context.OptionValues
                .Include(v => v.OptionGroup)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var term = filter.Search.Trim().ToLower();
                query = query.Where(v => v.Name.ToLower().Contains(term) || 
                                         (v.OptionGroup != null && v.OptionGroup.Name.ToLower().Contains(term)));
            }

            var values = await PaginatedList<OptionValue>.CreateAsync(
                query.OrderBy(v => v.OptionGroup!.Name).ThenBy(v => v.Name),
                page,
                pageSize);

            var viewModel = new OptionValueIndexViewModel
            {
                OptionValues = values,
                Filter = filter
            };

            return View(viewModel);
        }

        public IActionResult Create()
        {
            PopulateOptionGroups();
            return View(new OptionValue { IsActive = true });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(OptionValue model)
        {
            ValidateOptionValue(model);
            if (!ModelState.IsValid)
            {
                PopulateOptionGroups(model.OptionGroupId);
                return View(model);
            }

            _context.OptionValues.Add(model);
            _context.SaveChanges();
            TempData["SuccessMessage"] = $"Đã tạo giá trị tùy chọn '{model.Name}'.";
            return RedirectToAction(nameof(Index));
        }

        public IActionResult Edit(int id)
        {
            var value = _context.OptionValues.Find(id);
            if (value == null) return NotFound();

            PopulateOptionGroups(value.OptionGroupId);
            return View(value);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(int id, OptionValue model)
        {
            if (id != model.Id) return NotFound();

            ValidateOptionValue(model);
            if (!ModelState.IsValid)
            {
                PopulateOptionGroups(model.OptionGroupId);
                return View(model);
            }

            _context.OptionValues.Update(model);
            _context.SaveChanges();
            TempData["SuccessMessage"] = $"Đã cập nhật giá trị tùy chọn '{model.Name}'.";
            return RedirectToAction(nameof(Index));
        }

        public IActionResult Details(int id)
        {
            var value = _context.OptionValues
                .Include(v => v.OptionGroup)
                .AsNoTracking()
                .FirstOrDefault(v => v.Id == id);

            if (value == null) return NotFound();
            return View(value);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Delete(int id)
        {
            var value = _context.OptionValues.Find(id);
            if (value == null) return NotFound();

            _context.OptionValues.Remove(value);
            _context.SaveChanges();
            TempData["SuccessMessage"] = $"Đã chuyển giá trị tùy chọn '{value.Name}' vào thùng rác.";
            return RedirectToAction(nameof(Index));
        }

        public async Task<IActionResult> Trash(int page = 1)
        {
            const int pageSize = 10;
            var values = await PaginatedList<OptionValue>.CreateAsync(
                _context.OptionValues
                    .IgnoreQueryFilters()
                    .Include(v => v.OptionGroup)
                    .Where(v => v.IsDeleted)
                    .AsNoTracking()
                    .OrderByDescending(v => v.DeletedAt),
                page,
                pageSize);

            return View(values);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Restore(int id)
        {
            var value = _context.OptionValues
                .IgnoreQueryFilters()
                .FirstOrDefault(v => v.Id == id && v.IsDeleted);

            if (value == null) return NotFound();

            value.IsDeleted = false;
            value.DeletedAt = null;
            value.UpdatedAt = DateTime.UtcNow;
            _context.SaveChanges();

            TempData["SuccessMessage"] = $"Đã khôi phục giá trị tùy chọn '{value.Name}'.";
            return RedirectToAction(nameof(Trash));
        }

        private void PopulateOptionGroups(int? selectedId = null)
        {
            ViewBag.OptionGroups = new SelectList(
                _context.OptionGroups.AsNoTracking().OrderBy(g => g.Name),
                "Id",
                "Name",
                selectedId);
        }

        private void ValidateOptionValue(OptionValue model)
        {
            if (string.IsNullOrWhiteSpace(model.Name))
            {
                ModelState.AddModelError(nameof(OptionValue.Name), "Vui lòng nhập tên giá trị tùy chọn.");
            }

            if (model.OptionGroupId <= 0)
            {
                ModelState.AddModelError(nameof(OptionValue.OptionGroupId), "Vui lòng chọn nhóm tùy chọn.");
            }

            if (model.PriceSurcharge < 0)
            {
                ModelState.AddModelError(nameof(OptionValue.PriceSurcharge), "Phụ thu không được âm.");
            }

            if (model.StockQuantity < 0)
            {
                ModelState.AddModelError(nameof(OptionValue.StockQuantity), "Tồn kho không được âm.");
            }
        }
    }
}
