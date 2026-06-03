using CMS.Backend.Models;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    [Authorize]
    public class OptionGroupController : Controller
    {
        private readonly ApplicationDbContext _context;

        public OptionGroupController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index([FromQuery] OptionGroupFilterModel filter, int page = 1)
        {
            const int pageSize = 10;
            filter ??= new OptionGroupFilterModel();

            var query = _context.OptionGroups.Include(g => g.OptionValues).AsNoTracking();

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var term = filter.Search.Trim().ToLower();
                query = query.Where(g => g.Name.ToLower().Contains(term));
            }

            var groups = await PaginatedList<OptionGroup>.CreateAsync(
                query.OrderBy(g => g.Name),
                page,
                pageSize);

            var viewModel = new OptionGroupIndexViewModel
            {
                OptionGroups = groups,
                Filter = filter
            };

            return View(viewModel);
        }

        public IActionResult Create()
        {
            return View(new OptionGroup { MaxSelectable = 1 });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(OptionGroup model)
        {
            ValidateOptionGroup(model);
            if (!ModelState.IsValid) return View(model);

            _context.OptionGroups.Add(model);
            _context.SaveChanges();
            TempData["SuccessMessage"] = $"Đã tạo nhóm tùy chọn '{model.Name}'.";
            return RedirectToAction(nameof(Index));
        }

        public IActionResult Edit(int id)
        {
            var group = _context.OptionGroups.Find(id);
            if (group == null) return NotFound();
            return View(group);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(int id, OptionGroup model)
        {
            if (id != model.Id) return NotFound();

            ValidateOptionGroup(model);
            if (!ModelState.IsValid) return View(model);

            _context.OptionGroups.Update(model);
            _context.SaveChanges();
            TempData["SuccessMessage"] = $"Đã cập nhật nhóm tùy chọn '{model.Name}'.";
            return RedirectToAction(nameof(Index));
        }

        public IActionResult Details(int id)
        {
            var group = _context.OptionGroups
                .Include(g => g.OptionValues)
                .AsNoTracking()
                .FirstOrDefault(g => g.Id == id);

            if (group == null) return NotFound();
            return View(group);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Delete(int id)
        {
            var group = _context.OptionGroups.Find(id);
            if (group == null) return NotFound();

            _context.OptionGroups.Remove(group);
            _context.SaveChanges();
            TempData["SuccessMessage"] = $"Đã chuyển nhóm tùy chọn '{group.Name}' vào thùng rác.";
            return RedirectToAction(nameof(Index));
        }

        public async Task<IActionResult> Trash(int page = 1)
        {
            const int pageSize = 10;
            var groups = await PaginatedList<OptionGroup>.CreateAsync(
                _context.OptionGroups
                    .IgnoreQueryFilters()
                    .Where(g => g.IsDeleted)
                    .AsNoTracking()
                    .OrderByDescending(g => g.DeletedAt),
                page,
                pageSize);

            return View(groups);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Restore(int id)
        {
            var group = _context.OptionGroups
                .IgnoreQueryFilters()
                .FirstOrDefault(g => g.Id == id && g.IsDeleted);

            if (group == null) return NotFound();

            group.IsDeleted = false;
            group.DeletedAt = null;
            group.UpdatedAt = DateTime.UtcNow;
            _context.SaveChanges();

            TempData["SuccessMessage"] = $"Đã khôi phục nhóm tùy chọn '{group.Name}'.";
            return RedirectToAction(nameof(Trash));
        }

        private void ValidateOptionGroup(OptionGroup model)
        {
            if (string.IsNullOrWhiteSpace(model.Name))
            {
                ModelState.AddModelError(nameof(OptionGroup.Name), "Vui lòng nhập tên nhóm tùy chọn.");
            }

            if (model.MaxSelectable < 1)
            {
                ModelState.AddModelError(nameof(OptionGroup.MaxSelectable), "Số lựa chọn tối đa phải lớn hơn hoặc bằng 1.");
            }
        }
    }
}
