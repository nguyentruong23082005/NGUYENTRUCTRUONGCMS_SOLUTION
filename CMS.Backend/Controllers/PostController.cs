using CMS.Backend.Helpers;
using CMS.Backend.Models;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    [Authorize] // Buổi 5: Bắt buộc đăng nhập mới được vào
    public class PostController : Controller
    {
        private readonly ApplicationDbContext _context;

        public PostController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Post/Index
        public async Task<IActionResult> Index([FromQuery] PostFilterModel filter, int page = 1)
        {
            const int pageSize = 9;
            filter ??= new PostFilterModel();

            var query = _context.Posts
                .Include(p => p.PostCategory)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var term = filter.Search.Trim().ToLower();
                query = query.Where(p => p.Title.ToLower().Contains(term));
            }

            if (filter.CategoryId.HasValue)
            {
                query = query.Where(p => p.PostCategoryId == filter.CategoryId.Value);
            }

            var posts = await PaginatedList<Post>.CreateAsync(
                query.OrderByDescending(p => p.PublishedAt ?? p.CreatedAt),
                page,
                pageSize);

            var excerpts = new Dictionary<int, string>();
            foreach (var item in posts.Items)
            {
                excerpts[item.Id] = Helpers.HtmlTextHelper.StripHtml(item.Content);
            }
            ViewBag.PostExcerpts = excerpts;

            var categories = await _context.PostCategories
                .AsNoTracking()
                .OrderBy(c => c.Name)
                .ToListAsync();

            var viewModel = new PostIndexViewModel
            {
                Posts = posts,
                Filter = filter,
                Categories = new SelectList(categories, "Id", "Name", filter.CategoryId)
            };

            return View(viewModel);
        }

        // GET: Post/Details/5
        [AllowAnonymous]
        public IActionResult Details(int id)
        {
            var post = _context.Posts.Include(p => p.PostCategory).FirstOrDefault(p => p.Id == id);
            if (post == null) return NotFound();
            return View(post);
        }

        // GET: Post/Create
        [HttpGet]
        public IActionResult Create()
        {
            ViewBag.CategoryList = new SelectList(_context.PostCategories.ToList(), "Id", "Name");
            return View();
        }

        // POST: Post/Create with image upload
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(Post model, IFormFile? uploadImage)
        {
            if (!ModelState.IsValid)
            {
                ViewBag.CategoryList = new SelectList(_context.PostCategories.ToList(), "Id", "Name", model.PostCategoryId);
                return View(model);
            }

            if (uploadImage != null && uploadImage.Length > 0)
            {
                var uploadResult = ImageUploadHelper.SaveImage(uploadImage, filePrefix: "post");
                if (!uploadResult.Succeeded)
                {
                    ModelState.AddModelError(nameof(Post.ImageUrl), uploadResult.ErrorMessage ?? "Ảnh tải lên không hợp lệ.");
                    ViewBag.CategoryList = new SelectList(_context.PostCategories.ToList(), "Id", "Name", model.PostCategoryId);
                    return View(model);
                }

                model.ImageUrl = uploadResult.Url;
            }

            _context.Posts.Add(model);
            _context.SaveChanges();
            return RedirectToAction("Index");
        }

        // GET: Post/Edit/5
        [HttpGet]
        public IActionResult Edit(int id)
        {
            var post = _context.Posts.Find(id);
            if (post == null) return NotFound();

            ViewBag.CategoryList = new SelectList(_context.PostCategories.ToList(), "Id", "Name", post.PostCategoryId);
            return View(post);
        }

        // POST: Post/Edit with optional new image
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(Post model, IFormFile? uploadImage)
        {
            if (!ModelState.IsValid)
            {
                ViewBag.CategoryList = new SelectList(_context.PostCategories.ToList(), "Id", "Name", model.PostCategoryId);
                return View(model);
            }

            if (uploadImage != null && uploadImage.Length > 0)
            {
                var uploadResult = ImageUploadHelper.SaveImage(uploadImage, filePrefix: "post");
                if (!uploadResult.Succeeded)
                {
                    ModelState.AddModelError(nameof(Post.ImageUrl), uploadResult.ErrorMessage ?? "Ảnh tải lên không hợp lệ.");
                    ViewBag.CategoryList = new SelectList(_context.PostCategories.ToList(), "Id", "Name", model.PostCategoryId);
                    return View(model);
                }

                model.ImageUrl = uploadResult.Url;
            }
            else
            {
                // Giữ lại ảnh cũ nếu không upload ảnh mới
                var oldPost = _context.Posts.AsNoTracking().FirstOrDefault(p => p.Id == model.Id);
                if (oldPost != null && string.IsNullOrEmpty(model.ImageUrl))
                {
                    model.ImageUrl = oldPost.ImageUrl;
                }
            }

            _context.Posts.Update(model);
            _context.SaveChanges();
            return RedirectToAction("Index");
        }

        // POST: Post/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Delete(int id)
        {
            var post = _context.Posts.Find(id);
            if (post != null)
            {
                // Remove sẽ được ApplicationDbContext chuyển thành xóa mềm nếu Post kế thừa BaseEntity.
                _context.Posts.Remove(post);
                _context.SaveChanges();
            }
            return RedirectToAction("Index");
        }

        // GET: Post/Trash
        public async Task<IActionResult> Trash(int page = 1)
        {
            const int pageSize = 9;
            var posts = await PaginatedList<Post>.CreateAsync(
                _context.Posts
                    .IgnoreQueryFilters()
                    .Include(p => p.PostCategory)
                    .Where(p => p.IsDeleted)
                    .AsNoTracking()
                    .OrderByDescending(p => p.DeletedAt),
                page,
                pageSize);

            return View(posts);
        }

        // POST: Post/Restore/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Restore(int id)
        {
            var post = _context.Posts
                .IgnoreQueryFilters()
                .FirstOrDefault(p => p.Id == id && p.IsDeleted);

            if (post == null) return NotFound();

            post.IsDeleted = false;
            post.DeletedAt = null;
            post.UpdatedAt = DateTime.UtcNow;
            _context.SaveChanges();

            TempData["SuccessMessage"] = $"Đã khôi phục bài viết '{post.Title}'.";
            return RedirectToAction(nameof(Trash));
        }

        /// <summary>
        /// Upload ảnh cho CKEditor — chỉ người đã đăng nhập mới được phép (TC35).
        /// </summary>
        [HttpPost]
        [Route("/api/upload/ckeditor")]
        [IgnoreAntiforgeryToken]
        public IActionResult CKEditorUpload(IFormFile upload)
        {
            if (upload == null || upload.Length == 0)
                return BadRequest(new { uploaded = false, error = new { message = "File rỗng" } });

            var uploadResult = ImageUploadHelper.SaveImage(upload, "uploads/ckeditor", "ckeditor", allowGif: true);
            if (!uploadResult.Succeeded || string.IsNullOrWhiteSpace(uploadResult.Url))
            {
                return BadRequest(new { uploaded = false, error = new { message = uploadResult.ErrorMessage } });
            }

            var url = $"{Request.Scheme}://{Request.Host}{uploadResult.Url}";
            return Ok(new { uploaded = true, url });
        }
    }
}
