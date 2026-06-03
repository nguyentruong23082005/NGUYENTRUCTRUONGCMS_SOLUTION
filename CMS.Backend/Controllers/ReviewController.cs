using CMS.Backend.Models;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    [Authorize]
    public class ReviewController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ReviewController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index(ReviewFilterModel filter, int page = 1)
        {
            const int pageSize = 10;
            var query = _context.Reviews
                .Include(r => r.Product)
                .Include(r => r.Customer)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var searchTerm = filter.Search.Trim().ToLower();
                query = query.Where(r => 
                    (r.Product != null && r.Product.Name.ToLower().Contains(searchTerm)) || 
                    (r.Customer != null && r.Customer.FullName.ToLower().Contains(searchTerm)) ||
                    (r.Comment != null && r.Comment.ToLower().Contains(searchTerm))
                );
            }

            if (filter.Rating.HasValue)
            {
                query = query.Where(r => r.Rating == filter.Rating.Value);
            }

            var paginatedReviews = await PaginatedList<Review>.CreateAsync(
                query.OrderByDescending(r => r.CreatedAt),
                page,
                pageSize);

            var viewModel = new ReviewIndexViewModel
            {
                Reviews = paginatedReviews,
                Filter = filter
            };

            return View(viewModel);
        }

        public IActionResult Details(int id)
        {
            var review = _context.Reviews
                .Include(r => r.Product)
                .Include(r => r.Customer)
                .AsNoTracking()
                .FirstOrDefault(r => r.Id == id);

            if (review == null) return NotFound();
            return View(review);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Delete(int id)
        {
            var review = _context.Reviews.Find(id);
            if (review == null) return NotFound();

            _context.Reviews.Remove(review);
            _context.SaveChanges();
            TempData["SuccessMessage"] = $"Đã chuyển đánh giá #{review.Id} vào thùng rác.";
            return RedirectToAction(nameof(Index));
        }

        public async Task<IActionResult> Trash(int page = 1)
        {
            const int pageSize = 10;
            var reviews = await PaginatedList<Review>.CreateAsync(
                _context.Reviews
                    .IgnoreQueryFilters()
                    .Include(r => r.Product)
                    .Include(r => r.Customer)
                    .Where(r => r.IsDeleted)
                    .AsNoTracking()
                    .OrderByDescending(r => r.DeletedAt),
                page,
                pageSize);

            return View(reviews);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Restore(int id)
        {
            var review = _context.Reviews
                .IgnoreQueryFilters()
                .FirstOrDefault(r => r.Id == id && r.IsDeleted);

            if (review == null) return NotFound();

            review.IsDeleted = false;
            review.DeletedAt = null;
            review.UpdatedAt = DateTime.UtcNow;
            _context.SaveChanges();

            TempData["SuccessMessage"] = $"Đã khôi phục đánh giá #{review.Id}.";
            return RedirectToAction(nameof(Trash));
        }
    }
}
