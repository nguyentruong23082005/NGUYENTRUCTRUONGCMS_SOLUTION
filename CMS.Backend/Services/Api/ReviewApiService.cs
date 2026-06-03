using CMS.Backend.Models.Dtos;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CMS.Backend.Services.Api
{
    public sealed class ReviewApiService : IReviewApiService
    {
        private readonly ApplicationDbContext _db;

        public ReviewApiService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<IReadOnlyCollection<ReviewDto>> GetProductReviewsAsync(int productId, int page = 1, int pageSize = 10)
        {
            var p = page < 1 ? 1 : page;
            var ps = pageSize < 1 ? 10 : (pageSize > 50 ? 50 : pageSize);

            var reviews = await _db.Reviews
                .Where(r => r.ProductId == productId && !r.IsDeleted)
                .Include(r => r.Customer)
                .OrderByDescending(r => r.CreatedAt)
                .Skip((p - 1) * ps)
                .Take(ps)
                .Select(r => new ReviewDto
                {
                    Id = r.Id,
                    CustomerName = r.Customer != null ? r.Customer.FullName : "Ẩn danh",
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();

            return reviews.AsReadOnly();
        }

        public async Task<ReviewDto> CreateReviewAsync(int customerId, CreateReviewDto dto)
        {
            // 1. Kiểm tra sản phẩm tồn tại
            var productExists = await _db.Products.AnyAsync(p => p.Id == dto.ProductId && !p.IsDeleted);
            if (!productExists)
            {
                throw new InvalidOperationException("Sản phẩm không tồn tại.");
            }

            // 2. Kiểm tra khách hàng tồn tại
            var customer = await _db.Customers.FindAsync(customerId);
            if (customer == null || customer.IsDeleted)
            {
                throw new InvalidOperationException("Khách hàng không tồn tại hoặc đã bị xóa.");
            }

            // 3. Kiểm tra trùng lặp: một khách hàng chỉ được đánh giá một sản phẩm một lần
            var alreadyReviewed = await _db.Reviews.AnyAsync(r => r.CustomerId == customerId && r.ProductId == dto.ProductId && !r.IsDeleted);
            if (alreadyReviewed)
            {
                throw new InvalidOperationException("Bạn đã đánh giá sản phẩm này rồi.");
            }

            // 4. Kiểm tra xem khách hàng đã mua sản phẩm đó và đơn hàng đã hoàn thành hoặc đã giao chưa
            var hasPurchased = await _db.Orders.AnyAsync(o => o.CustomerId == customerId 
                && (o.Status == OrderStatus.Completed || o.Status == OrderStatus.Delivered)
                && !o.IsDeleted
                && o.OrderDetails.Any(od => od.ProductId == dto.ProductId && !od.IsDeleted));

            if (!hasPurchased)
            {
                throw new InvalidOperationException("Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua hàng và đơn hàng được hoàn thành hoặc giao hàng thành công.");
            }

            var review = new Review
            {
                ProductId = dto.ProductId,
                CustomerId = customerId,
                Rating = dto.Rating,
                Comment = dto.Comment?.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _db.Reviews.Add(review);
            await _db.SaveChangesAsync();

            return new ReviewDto
            {
                Id = review.Id,
                CustomerName = customer.FullName,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt
            };
        }
    }
}
